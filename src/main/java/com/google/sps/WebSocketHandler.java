package com.google.sps;

public class WebSocketHandler {

    private static WebSocketHandler instance;

    private WebSocketHandler() {

    }

    public static WebSocketHandler getInstance() {
        if (instance == null) {
            instance = new WebSocketHandler();
        }

        return instance;
    }


}
