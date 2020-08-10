package com.google.sps;

import java.util.ArrayList;

import org.json.JSONObject;
import org.json.JSONArray;

import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.KeyFactory;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.ListValue;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.Value;
import com.google.cloud.datastore.PathElement;
import com.google.cloud.datastore.Query;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.QueryResults;

public class DatastoreManager {

    public static final String KIND_CHATROOM = "CHAT_ROOM";
    public static final String KIND_USERS = "USER_DATA";
    public static final String KIND_CHATROOM_HISTORY = "CHAT_HISTORY";
    public static final String KIND_CHATROOM_MARKERS = "MAP_MARKERS";

    private static DatastoreManager currentInstance;

    private final Datastore datastore;
    private final KeyFactory roomFactory;
    private final KeyFactory userFactory;

    private DatastoreManager() {
        datastore = DatastoreOptions.getDefaultInstance().getService();
        roomFactory = datastore.newKeyFactory().setKind(KIND_CHATROOM);
        userFactory = datastore.newKeyFactory().setKind(KIND_USERS);
    }

    public long addMarker(String roomId, JSONObject markerData) {
        KeyFactory markerFactory =
            datastore.newKeyFactory()
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId))
                     .setKind(KIND_CHATROOM_MARKERS);

        Key markerKey = datastore.allocateId(markerFactory.newKey());

        return putMarker(roomId, markerData, markerKey);
    }

    public long updateMarker(String roomId, JSONObject markerData) {
        KeyFactory markerFactory =
            datastore.newKeyFactory()
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId))
                     .setKind(KIND_CHATROOM_MARKERS);

        Key markerKey = markerFactory.newKey(markerData.getLong(
            ChatWebSocket.JSON_ID));

        return putMarker(roomId, markerData, markerKey);
    }

    private long putMarker(String roomId, JSONObject markerData, Key key) {
        Entity markerEntity =
            Entity.newBuilder(key)
                  .set(ChatWebSocket.JSON_TITLE,
                        markerData.getString(ChatWebSocket.JSON_TITLE))
                  .set(ChatWebSocket.JSON_BODY,
                        markerData.getString(ChatWebSocket.JSON_BODY))
                  .set(ChatWebSocket.JSON_LATITUDE,
                        markerData.getDouble(ChatWebSocket.JSON_LATITUDE))
                  .set(ChatWebSocket.JSON_LONGITUDE,
                        markerData.getDouble(ChatWebSocket.JSON_LONGITUDE))
                  .build();

        datastore.put(markerEntity);

        return key.getId();
    }

    public void deleteMarker(String roomId, long markerId) {
        KeyFactory markerFactory =
            datastore.newKeyFactory()
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId))
                     .setKind(KIND_CHATROOM_MARKERS);

        datastore.delete(markerFactory.newKey(markerId));
    }

    public void addMessage(String roomId, JSONObject messageData) {
        KeyFactory chatHistoryFactory =
            datastore.newKeyFactory()
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId))
                     .setKind(KIND_CHATROOM_HISTORY);

        Entity messageEntity =
            Entity.newBuilder(datastore.allocateId(
                     chatHistoryFactory.newKey()))
                  .set(ChatWebSocket.JSON_USER_ID,
                        messageData.getString(ChatWebSocket.JSON_USER_ID))
                  .set(ChatWebSocket.JSON_MESSAGE,
                        messageData.getString(ChatWebSocket.JSON_MESSAGE))
                  .build();

        datastore.put(messageEntity);
    }

    public String loadMarkerData(String roomId) {
        Query<Entity> markerQuery = Query.newEntityQueryBuilder()
            .setKind(KIND_CHATROOM_MARKERS)
            .setFilter(PropertyFilter.hasAncestor(
                roomFactory.newKey(roomId)))
            .build();

        QueryResults<Entity> markers = datastore.run(markerQuery);

        JSONArray markersJson = new JSONArray();

        while (markers.hasNext()) {
            Entity markerEntity = markers.next();

            JSONObject markerObject = new JSONObject();
            markerObject.put(ChatWebSocket.JSON_ID,
                            ((Key) markerEntity.getKey()).getId())
                        .put(ChatWebSocket.JSON_TITLE,
                            markerEntity.getString(ChatWebSocket.JSON_TITLE))
                        .put(ChatWebSocket.JSON_BODY,
                            markerEntity.getString(ChatWebSocket.JSON_BODY))
                        .put(ChatWebSocket.JSON_LATITUDE,
                            markerEntity.getDouble(ChatWebSocket.JSON_LATITUDE))
                        .put(ChatWebSocket.JSON_LONGITUDE,
                            markerEntity.getDouble(
                                ChatWebSocket.JSON_LONGITUDE));

            markersJson.put(markerObject);
        }

        return markersJson.toString();
    }

    public String loadChatHistory(String roomId) {
        Query<Entity> historyQuery = Query.newEntityQueryBuilder()
            .setKind(KIND_CHATROOM_HISTORY)
            .setFilter(PropertyFilter.hasAncestor(
                roomFactory.newKey(roomId)))
            .build();

        QueryResults<Entity> history = datastore.run(historyQuery);

        JSONArray historyJson = new JSONArray();

        while (history.hasNext()) {
            Entity messageEntity = history.next();

            JSONObject messageObject = new JSONObject();
            messageObject.put(ChatWebSocket.JSON_USER_ID,
                           messageEntity.getString(ChatWebSocket.JSON_USER_ID))
                         .put(ChatWebSocket.JSON_MESSAGE,
                           messageEntity.getString(ChatWebSocket.JSON_MESSAGE));

            historyJson.put(messageObject);
        }

        return historyJson.toString();
    }

    public static DatastoreManager getInstance() {
        if (currentInstance == null) {
            currentInstance = new DatastoreManager();
        }

        return currentInstance;
    }
}
