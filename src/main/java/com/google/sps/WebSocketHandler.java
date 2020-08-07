package com.google.sps;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;

import javax.websocket.Session;

public class WebSocketHandler {

    private static WebSocketHandler instance;

    private HashMap<String, List<Session>> chatRoomMap;

    private WebSocketHandler() {
        chatRoomMap = new HashMap<String, List<Session>>();
    }

    public static WebSocketHandler getInstance() {
        if (instance == null) {
            instance = new WebSocketHandler();
        }

        return instance;
    }

    public void addSession(String roomId, Session session) {
        if (!chatRoomMap.containsKey(roomId)) {
            chatRoomMap.put(roomId, new ArrayList<Session>());
        }

        chatRoomMap.get(roomId).add(session);
        System.out.println(chatRoomMap.get(roomId).get(0).getId());
    }

    public List<Session> getRoomList(String roomId) {
        if (chatRoomMap.containsKey(roomId)) {
            System.out.println("Contains the key ID");

            ArrayList<Session> returnList = new ArrayList<Session>();

            System.out.println("After new List");

            for (Session participant : chatRoomMap.get(roomId)) {
                returnList.add(participant);
            }

            System.out.println("After key ID");

            return returnList;
        }

        return null;
    }

    public void removeSession(String roomId, Session session) {
        List<Session> roomList = chatRoomMap.get(roomId);

        roomList.remove(session);

        if (roomList.isEmpty()) {
            chatRoomMap.remove(roomId);
        }
    }
}
