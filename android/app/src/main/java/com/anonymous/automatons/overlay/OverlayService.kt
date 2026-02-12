package com.anonymous.automatons.overlay

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import com.anonymous.automatons.R
import com.anonymous.automatons.bridge.AccessibilityModule

class OverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: View
    private lateinit var params: WindowManager.LayoutParams
    private lateinit var statusTextView: TextView
    private lateinit var commandInput: EditText
    private lateinit var startButton: Button
    private lateinit var stopButton: Button

    private var initialX: Int = 0
    private var initialY: Int = 0
    private var initialTouchX: Float = 0f
    private var initialTouchY: Float = 0f

    init {
        instance = this
    }

    companion object {
        var instance: OverlayService? = null
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()

        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_layout, null)

        statusTextView = overlayView.findViewById(R.id.status_text)
        commandInput = overlayView.findViewById(R.id.command_input)
        startButton = overlayView.findViewById(R.id.start_automation_button)
        stopButton = overlayView.findViewById(R.id.stop_automation_button)

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )

        params.gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
        params.x = 0
        params.y = 100

        windowManager.addView(overlayView, params)

        // Drag functionality
        overlayView.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                when (event?.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, params)
                        return true
                    }
                }
                return false
            }
        })

        startButton.setOnClickListener {
            val command = commandInput.text.toString()
            AccessibilityModule.instance?.sendEvent("onCommand", command)
            updateStatus("Command sent: $command")
        }

        stopButton.setOnClickListener {
            AccessibilityModule.instance?.sendEvent("onStopAutomation", "Automation Stopped")
            updateStatus("Automation Stopped")
        }
    }

    fun updateStatus(status: String) {
        statusTextView.post {
            statusTextView.text = status
        }
    }

    fun setFocusable(focusable: Boolean) {
        if (focusable) {
            params.flags = params.flags and WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE.inv()
        } else {
            params.flags = params.flags or WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
        }
        windowManager.updateViewLayout(overlayView, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
    }
}
