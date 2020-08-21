package com.google.sps.servlets;

import com.google.sps.CapstoneAuth;
import com.google.sps.DatastoreManager;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/authentication")
public class AuthServlet extends HttpServlet {

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String tokenId = request.getReader().readLine();

        String responseText = Boolean.toString(
            CapstoneAuth.isUserAuthenticated(tokenId));

        response.setContentType("text/html");
        response.getWriter().println(responseText);
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
      String tokenId = request.getParameter("idToken");
      long roomId = Long.parseLong(request.getParameter("idRoom"));

      if (!CapstoneAuth.isUserAuthenticated(tokenId)) {
          response.sendError(HttpServletResponse.SC_FORBIDDEN);
          return;
      }

      boolean isAllowed = true;

      if (!DatastoreManager.getInstance().isUserAllowedChatroom(
              CapstoneAuth.getUserId(tokenId), roomId)) {
          isAllowed = false;
      }

      response.setContentType("text/html");
      response.getWriter().print(isAllowed);
    }
}
