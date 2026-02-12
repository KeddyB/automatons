package com.anonymous.automatons.accessibility

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.anonymous.automatons.bridge.AccessibilityModule
import com.anonymous.automatons.engine.ScreenParser

class MyAccessibilityService : AccessibilityService() {

    init {
        instance = this
    }

    companion object {
        var instance: MyAccessibilityService? = null
    }

    private val TAG = "MyAccessibilityService"

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        Log.d(TAG, "onAccessibilityEvent: " + event?.toString())
        AccessibilityModule.instance?.sendEvent("onAccessibilityEvent", event.toString())

        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED || event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val rootNode = rootInActiveWindow
            if (rootNode != null) {
                try {
                    val json = ScreenParser.parse(rootNode)
                    AccessibilityModule.instance?.sendEvent("onScreenContentChanged", json.toString())
                } finally {
                    rootNode.recycle()
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "onInterrupt")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "onServiceConnected")
    }

    fun getScreenContent(): String? {
        val rootNode = rootInActiveWindow
        if (rootNode != null) {
            try {
                val json = ScreenParser.parse(rootNode)
                return json.toString()
            } finally {
                rootNode.recycle()
            }
        }
        return null
    }

    fun getFlattenedScreenContent(): String? {
        val rootNode = rootInActiveWindow
        if (rootNode != null) {
            try {
                val list = org.json.JSONArray()
                ScreenParser.flatten(rootNode, list)
                return list.toString()
            } finally {
                rootNode.recycle()
            }
        }
        return null
    }

    fun findElementByText(text: String): AccessibilityNodeInfo? {
        return findNode { it.text?.toString() == text }
    }

    fun findElementByResourceId(id: String): AccessibilityNodeInfo? {
        return findNode { it.viewIdResourceName == id }
    }

    fun findElementByIndex(index: Int): AccessibilityNodeInfo? {
        var currentIndex = 0
        return findNode { node ->
            val isInteresting = node.isClickable || node.isScrollable || node.isEditable || !node.text.isNullOrEmpty() || !node.contentDescription.isNullOrEmpty()
            if (isInteresting) {
                if (currentIndex == index) {
                    return@findNode true
                }
                currentIndex++
            }
            false
        }
    }

    private fun findNode(predicate: (AccessibilityNodeInfo) -> Boolean): AccessibilityNodeInfo? {
        val rootNode = rootInActiveWindow ?: return null
        val queue = ArrayDeque<AccessibilityNodeInfo>()
        var foundNode: AccessibilityNodeInfo? = null

        try {
            queue.add(rootNode)
            while (queue.isNotEmpty()) {
                val node = queue.removeFirst()
                if (predicate(node)) {
                    foundNode = node
                    break
                }
                for (i in 0 until node.childCount) {
                    val child = node.getChild(i)
                    if (child != null) {
                        queue.add(child)
                    }
                }
                node.recycle()
            }
        } finally {
            while(queue.isNotEmpty()) {
                queue.removeFirst().recycle()
            }
            if (foundNode == null) {
                rootNode.recycle()
            }
        }
        return foundNode
    }
}
