<!DOCTYPE html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.sps.HelloAppEngine" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.users.UserService" %>

<%! UserService userService = UserServiceFactory.getUserService(); %>

<html>
    <head>
        <title>CHAP</title>
    </head>
    <body>
        <h1>CHAP</h1>
        <h3>Hello <% if (userService.isUserLoggedIn()) {
            out.println(userService.getCurrentUser().getEmail() + ".");
        }
        else {
            out.println("stranger.");
        } %></h3>

        <a href="<%= userService.isUserLoggedIn() ? userService.createLogoutURL("/") : userService.createLoginURL("/") %>"><%= userService.isUserLoggedIn() ? "Log out" : "Log in"%></a>
    </body>
</html>