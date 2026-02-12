package com.anonymous.automatons.bridge

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.anonymous.automatons.accessibility.MyAccessibilityService
import com.anonymous.automatons.engine.ActionExecutor
import com.anonymous.automatons.overlay.OverlayService
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class AccessibilityModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        instance = this
    }

    companion object {
        var instance: AccessibilityModule? = null
    }

    override fun getName() = "AccessibilityModule"

    fun sendEvent(eventName: String, message: String?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, message)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun hasOverlayPermission(callback: Callback) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            callback.invoke(Settings.canDrawOverlays(reactApplicationContext))
        } else {
            callback.invoke(true)
        }
    }

    @ReactMethod
    fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactApplicationContext.packageName)
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun startOverlay() {
        val intent = Intent(reactApplicationContext, OverlayService::class.java)
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun stopOverlay() {
        val intent = Intent(reactApplicationContext, OverlayService::class.java)
        reactApplicationContext.stopService(intent)
    }

    @ReactMethod
    fun getScreenContent(callback: Callback) {
        val content = MyAccessibilityService.instance?.getScreenContent()
        callback.invoke(content)
    }

    @ReactMethod
    fun getFlattenedScreenContent(callback: Callback) {
        val content = MyAccessibilityService.instance?.getFlattenedScreenContent()
        callback.invoke(content)
    }

    @ReactMethod
    fun clickElementByText(text: String, callback: Callback) {
        val service = MyAccessibilityService.instance
        if (service != null) {
            val node = service.findElementByText(text)
            if (node != null) {
                try {
                    val result = ActionExecutor.click(node)
                    callback.invoke(result)
                } finally {
                    node.recycle()
                }
            } else {
                callback.invoke(false)
            }
        } else {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun clickElementByIndex(index: Int, callback: Callback) {
        val service = MyAccessibilityService.instance
        if (service != null) {
            val node = service.findElementByIndex(index)
            if (node != null) {
                try {
                    val result = ActionExecutor.click(node)
                    callback.invoke(result)
                } finally {
                    node.recycle()
                }
            } else {
                callback.invoke(false)
            }
        } else {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun inputTextElementByText(text: String, value: String, callback: Callback) {
        val service = MyAccessibilityService.instance
        if (service != null) {
            val node = service.findElementByText(text)
            if (node != null) {
                try {
                    val result = ActionExecutor.setText(node, value)
                    callback.invoke(result)
                } finally {
                    node.recycle()
                }
            } else {
                callback.invoke(false)
            }
        } else {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun inputTextElementByIndex(index: Int, value: String, callback: Callback) {
        val service = MyAccessibilityService.instance
        if (service != null) {
            val node = service.findElementByIndex(index)
            if (node != null) {
                try {
                    val result = ActionExecutor.setText(node, value)
                    callback.invoke(result)
                } finally {
                    node.recycle()
                }
            } else {
                callback.invoke(false)
            }
        } else {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun scrollForwardElementByText(text: String, callback: Callback) {
        val service = MyAccessibilityService.instance
        if (service != null) {
            val node = service.findElementByText(text)
            if (node != null) {
                try {
                    val result = ActionExecutor.scrollForward(node)
                    callback.invoke(result)
                } finally {
                    node.recycle()
                }
            } else {
                callback.invoke(false)
            }
        } else {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun scrollBackwardElementByText(text: String, callback: Callback) {
        val service = MyAccessibilityService.instance
        if (service != null) {
            val node = service.findElementByText(text)
            if (node != null) {
                try {
                    val result = ActionExecutor.scrollBackward(node)
                    callback.invoke(result)
                } finally {
                    node.recycle()
                }
            } else {
                callback.invoke(false)
            }
        } else {
            callback.invoke(false)
        }
    }

    @ReactMethod
    fun updateOverlayStatus(status: String) {
        OverlayService.instance?.updateStatus(status)
    }

    @ReactMethod
    fun isServiceEnabled(callback: Callback) {
        callback.invoke(MyAccessibilityService.instance != null)
    }

    @ReactMethod
    fun setOverlayFocusable(focusable: Boolean) {
        OverlayService.instance?.setFocusable(focusable)
    }
}
