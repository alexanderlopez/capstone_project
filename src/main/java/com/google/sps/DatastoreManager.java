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

    private static final String KIND_CHATROOM = "CHAT_ROOM";
    private static final String KIND_USERS = "USER_DATA";
    private static final String KIND_CHATROOM_HISTORY = "CHAT_HISTORY";
    private static final String KIND_CHATROOM_MARKERS = "MAP_MARKERS";

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
        Entity markerEntity =
            Entity.newBuilder(markerKey)
                  .set("title", markerData.getString("title"))
                  .set("body", markerData.getString("body"))
                  .set("lat", markerData.getDouble("lat"))
                  .set("lng", markerData.getDouble("lng"))
                  .build();

        datastore.put(markerEntity);

        return markerKey.getId();
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
                  .set("uid", messageData.getString("uid"))
                  .set("message", messageData.getString("message"))
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
            markerObject.put("id",((Key) markerEntity.getKey()).getId())
                        .put("title", markerEntity.getString("title"))
                        .put("body", markerEntity.getString("body"))
                        .put("lat", markerEntity.getDouble("lat"))
                        .put("lng", markerEntity.getDouble("lng"));

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
            messageObject.put("uid", messageEntity.getString("uid"))
                         .put("message", messageEntity.getString("message"));

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
