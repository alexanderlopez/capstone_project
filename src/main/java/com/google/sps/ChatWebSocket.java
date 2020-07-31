package com.google.sps;

import java.io.IOException;
import java.util.ArrayList;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.CloseReason;

import javax.websocket.server.ServerEndpoint;

import com.google.sps.CapstoneAuth;

@ServerEndpoint(value = "/chat/{chatroom}")
public class ChatWebSocket {

    @OnOpen
    public void onOpen(Session session) throws IOException {
        // Get session and check if the user is authenticated with Firebase
        String chatRoom = session.getPathParameters()
                                 .get("chatroom");

        String idToken = session.getRequestParameterMap()
                                .get("idToken")
                                .get(0);

        if (!CapstoneAuth.isUserAuthenticated(idToken)) {
            session.close(new CloseReason(
                CloseReason.CloseCodes.PROTOCOL_ERROR,
                 "User not authenticated."));
        }
    }

    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        // Handle new messages
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        // WebSocket connection closes
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }
}
