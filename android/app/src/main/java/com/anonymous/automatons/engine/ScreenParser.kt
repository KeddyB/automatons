package com.anonymous.automatons.engine

import android.graphics.Rect
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject

object ScreenParser {

    fun parse(node: AccessibilityNodeInfo?): JSONObject? {
        if (node == null) return null

        val json = JSONObject()
        json.put("className", node.className)
        json.put("text", node.text)
        json.put("contentDescription", node.contentDescription)
        json.put("resourceId", node.viewIdResourceName)
        json.put("isClickable", node.isClickable)
        json.put("isScrollable", node.isScrollable)
        json.put("isEditable", node.isEditable)

        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        val boundsJson = JSONObject()
        boundsJson.put("left", bounds.left)
        boundsJson.put("top", bounds.top)
        boundsJson.put("right", bounds.right)
        boundsJson.put("bottom", bounds.bottom)
        json.put("bounds", boundsJson)

        val children = JSONArray()
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                val childJson = parse(child)
                if (childJson != null) children.put(childJson)
                child.recycle()
            }
        }
        json.put("children", children)

        return json
    }

    fun flatten(node: AccessibilityNodeInfo?, list: JSONArray) {
        if (node == null) return

        val isInteresting = node.isClickable || node.isScrollable || node.isEditable || !node.text.isNullOrEmpty() || !node.contentDescription.isNullOrEmpty()

        if (isInteresting) {
            val json = JSONObject()
            json.put("id", list.length())
            json.put("className", node.className)
            json.put("text", node.text)
            json.put("contentDescription", node.contentDescription)
            json.put("resourceId", node.viewIdResourceName)
            json.put("isClickable", node.isClickable)
            json.put("isScrollable", node.isScrollable)
            json.put("isEditable", node.isEditable)
            list.put(json)
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                flatten(child, list)
                child.recycle()
            }
        }
    }
}
