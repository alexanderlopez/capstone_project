package com.google.sps.servlets;

import com.google.sps.CapstoneAuth;
import com.google.sps.DatastoreManager;
import com.google.sps.ChatWebSocket;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import java.io.IOException;

@WebServlet("/user-server")
public class UserServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String tokenId = request.getParameter("idToken");
        boolean getUserDetails =
            Boolean.parseBoolean(request.getParameter("getUserDetails"));

        if (!CapstoneAuth.isUserAuthenticated(tokenId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        String uid = CapstoneAuth.getUserId(tokenId);

        response.setContentType("application/json");
        response.getWriter().println(
            DatastoreManager.getInstance().getUserData(uid, getUserDetails));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        JSONObject newUserData = new JSONObject(request.getReader().readLine());

        String tokenId = newUserData.getString(ChatWebSocket.JSON_ID);
        String userName = newUserData.getString(ChatWebSocket.JSON_USER_NAME);

        if (!CapstoneAuth.isUserAuthenticated(tokenId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        String uid = CapstoneAuth.getUserId(tokenId);

        DatastoreManager.getInstance().createUser(uid, userName);

        response.setContentType("text/html");
        response.getWriter().println(true);
    }
}
