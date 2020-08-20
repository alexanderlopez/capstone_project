package com.google.sps.servlets;

import com.google.sps.CapstoneAuth;
import com.google.sps.DatastoreManager;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/chat-server")
public class ChatHistory extends HttpServlet {

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

        response.setContentType("application/json");
        response.getWriter().println(DatastoreManager.getInstance()
            .loadChatHistory(roomId));
    }
}
