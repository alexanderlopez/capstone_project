package com.google.sps.servlets;

import com.google.sps.CapstoneAuth;
import com.google.sps.DatastoreManager;
import com.google.sps.ChatWebSocket;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.json.JSONArray;

import java.io.IOException;

@WebServlet("/share-server")
public class ShareServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String tokenId = request.getParameter("idToken");
        long roomId = Long.parseLong(request.getParameter("idRoom"));

        if (!CapstoneAuth.isUserAuthenticated(tokenId) ||
                !DatastoreManager.getInstance().isUserAllowedChatroom(
                CapstoneAuth.getUserId(tokenId), roomId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        response.getWriter().println(DatastoreManager.getInstance().
            getAllowedUsers(roomId));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        JSONObject shareUserData =
            new JSONObject(request.getReader().readLine());

        String tokenId = shareUserData.getString(ChatWebSocket.JSON_ID);
        long roomId = shareUserData.getLong(ChatWebSocket.JSON_ROOM_ID);

        if (!CapstoneAuth.isUserAuthenticated(tokenId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        String uid = CapstoneAuth.getUserId(tokenId);

        if (!DatastoreManager.getInstance()
                .isUserAllowedChatroom(uid, roomId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        JSONArray emailArray = shareUserData.getJSONArray(
            ChatWebSocket.JSON_EMAIL_ARRAY);

        for (int i = 0; i < emailArray.length(); i++) {
            String userEmail = emailArray.getString(i);
            DatastoreManager.getInstance().addUserToChatRoom(roomId, userEmail);
        }

        response.setContentType("text/html");
        response.getWriter().print(true);
    }
}
