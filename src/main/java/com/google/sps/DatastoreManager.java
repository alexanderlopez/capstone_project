package com.google.sps;

import java.util.HashMap;

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
import com.google.cloud.datastore.StructuredQuery.OrderBy;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.TimestampValue;

import com.google.cloud.Timestamp;

public class DatastoreManager {

    public static final String KIND_CHATROOM = "CHAT_ROOM";
    public static final String KIND_USERS = "USER_DATA";
    public static final String KIND_CHATROOM_HISTORY = "CHAT_HISTORY";
    public static final String KIND_CHATROOM_MARKERS = "MAP_MARKERS";

    public static final String ROOM_ATTRIBUTE_NAME = "name";
    public static final String USER_ATTRIBUTE_NAME = "preferred_name";
    public static final String USER_ATTRIBUTE_EMAIL = "email";
    public static final String CHILD_ROOM_ATTRIBUTE_ID = "room_id";

    private static DatastoreManager currentInstance;

    private final Datastore datastore;
    private final KeyFactory roomFactory;
    private final KeyFactory userFactory;

    // User Id -> username
    private HashMap<String, String> idToName;

    private DatastoreManager() {
        datastore = DatastoreOptions.getDefaultInstance().getService();
        roomFactory = datastore.newKeyFactory().setKind(KIND_CHATROOM);
        userFactory = datastore.newKeyFactory().setKind(KIND_USERS);

        idToName = new HashMap<String, String>();
    }

    /**
     * Adds the marker @param markerData to the datastore using the specified
     * key @param newKey. Returns @return the long id of the marker added.
     */
    public long addMarker(Key newKey, JSONObject markerData) {
        return putMarker(markerData, newKey);
    }

    /**
     * Creates a new key object for a new marker with the given @param roomId.
     */
    public Key newMarkerKey(long roomId) {
        KeyFactory markerFactory =
            datastore.newKeyFactory()
                     .setKind(KIND_CHATROOM_MARKERS)
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId));

        Key markerKey = datastore.allocateId(markerFactory.newKey());

        return markerKey;
    }

    /**
     * Updates the marker with the given @param roomId and with information
     * @param markerData that includes the datastore id of the marker.
     * This pushes the changes to datastore.
     */
    public long updateMarker(long roomId, JSONObject markerData) {
        KeyFactory markerFactory =
            datastore.newKeyFactory()
                     .setKind(KIND_CHATROOM_MARKERS)
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId));

        Key markerKey = markerFactory.newKey(markerData.getLong(
            ChatWebSocket.JSON_ID));

        return putMarker(markerData, markerKey);
    }

    private long putMarker(JSONObject markerData, Key key) {
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

    /**
     * Deletes the marker with the associated @param markerId and @param roomId.
     */
    public void deleteMarker(long roomId, long markerId) {
        KeyFactory markerFactory =
            datastore.newKeyFactory()
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId))
                     .setKind(KIND_CHATROOM_MARKERS);

        datastore.delete(markerFactory.newKey(markerId));
    }

    /**
     * Adds a message with the given @param roomId to the datastore.
     */
    public void addMessage(long roomId, JSONObject messageData) {
        KeyFactory chatHistoryFactory =
            datastore.newKeyFactory()
                     .setKind(KIND_CHATROOM_HISTORY)
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId));

        Entity messageEntity =
            Entity.newBuilder(datastore.allocateId(
                     chatHistoryFactory.newKey()))
                  .set(ChatWebSocket.JSON_USER_ID,
                        messageData.getString(ChatWebSocket.JSON_USER_ID))
                  .set(ChatWebSocket.JSON_MESSAGE,
                        messageData.getString(ChatWebSocket.JSON_MESSAGE))
                  .set(ChatWebSocket.JSON_TIMESTAMP,
                        TimestampValue.of(Timestamp.now()))
                  .build();

        datastore.put(messageEntity);
    }

    /**
     * Loads the marker information from datastore associated with the room
     * @param roomId .
     */
    public String loadMarkerData(long roomId) {
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

    /**
     * Loads the chat history from datastore associated with the room
     * @param roomId .
     */
    public String loadChatHistory(long roomId) {
        Query<Entity> historyQuery = Query.newEntityQueryBuilder()
            .setKind(KIND_CHATROOM_HISTORY)
            .setFilter(PropertyFilter.hasAncestor(
                roomFactory.newKey(roomId)))
            .setOrderBy(OrderBy.asc(ChatWebSocket.JSON_TIMESTAMP))
            .build();

        QueryResults<Entity> history = datastore.run(historyQuery);

        JSONArray historyJson = new JSONArray();

        while (history.hasNext()) {
            Entity messageEntity = history.next();

            JSONObject messageObject = new JSONObject();
            messageObject.put(ChatWebSocket.JSON_USER_NAME,
                           getUserName(messageEntity.getString(
                                ChatWebSocket.JSON_USER_ID)))
                         .put(ChatWebSocket.JSON_MESSAGE,
                           messageEntity.getString(ChatWebSocket.JSON_MESSAGE));

            historyJson.put(messageObject);
        }

        return historyJson.toString();
    }

    public String getUserName(String uid) {
        if (idToName.containsKey(uid)) {
            return idToName.get(uid);
        }

        Entity userEntity = datastore.get(userFactory.newKey(uid));

        if (userEntity == null) {
            return null;
        }

        String username = userEntity.getString(USER_ATTRIBUTE_NAME);
        idToName.put(uid, username);

        return username;
    }

    public void refreshNameCache() {
        idToName = new HashMap<String, String>();
    }

    public long createChatRoom(String roomName, String allowedUserId) {
        Key chatRoomKey = datastore.allocateId(roomFactory.newKey());
        Key childChatRoomKey = datastore.newKeyFactory()
                                        .setKind(KIND_CHATROOM)
                                        .addAncestor(PathElement.of(
                                                KIND_USERS, allowedUserId))
                                        .newKey(chatRoomKey.getId());

        Entity newChatRoom = Entity.newBuilder(chatRoomKey)
                                   .set(ROOM_ATTRIBUTE_NAME, roomName)
                                   .build();

        Entity childChatRoom =
            Entity.newBuilder(childChatRoomKey)
                  .set(ROOM_ATTRIBUTE_NAME, roomName)
                  .build();

        datastore.put(newChatRoom);
        datastore.put(childChatRoom);

        return chatRoomKey.getId();
    }

    public void addUserToChatRoom(long roomId, String email) {
        Entity roomEntity = datastore.get(roomFactory.newKey(roomId));

        if (roomEntity == null) {
            return;
        }

        String roomName = roomEntity.getString(ROOM_ATTRIBUTE_NAME);

        Query<Entity> userQuery = Query.newEntityQueryBuilder()
            .setKind(KIND_USERS)
            .setFilter(PropertyFilter.eq(USER_ATTRIBUTE_EMAIL, email))
            .build();

        QueryResults<Entity> usersResult = datastore.run(userQuery);

        while (usersResult.hasNext()) {
            Entity user = usersResult.next();
            String uid = ((Key) user.getKey()).getName();

            Key childChatRoomKey = datastore.newKeyFactory()
                                            .setKind(KIND_CHATROOM)
                                            .addAncestor(PathElement.of(
                                                KIND_USERS, uid))
                                            .newKey(roomId);
            Entity childChatRoom = Entity.newBuilder(childChatRoomKey)
                                         .set(ROOM_ATTRIBUTE_NAME, roomName)
                                         .build();

            datastore.put(childChatRoom);
        }
    }

    public void createUser(String uid, String preferredName) {
        Entity userEntity = Entity.newBuilder(userFactory.newKey(uid))
                                  .set(USER_ATTRIBUTE_NAME, preferredName)
                                  .set(USER_ATTRIBUTE_EMAIL,
                                        CapstoneAuth.getUserEmail(uid))
                                  .build();
        datastore.put(userEntity);
    }

    public String getUserData(String uid, boolean getDetails) {
        // Gets the user name, the and the chatrooms that the user is logged in to.
        JSONObject userData = new JSONObject();

        Key userKey = userFactory.newKey(uid);
        Entity userEntity = datastore.get(userFactory.newKey(uid));

        if (userEntity == null || !userEntity.contains(USER_ATTRIBUTE_NAME)) {
            return (new JSONObject()).toString();
        }

        userData.put(ChatWebSocket.JSON_USER_NAME,
            userEntity.getString(USER_ATTRIBUTE_NAME));

        if (getDetails) {
            JSONArray userRooms = new JSONArray();
            Query<Entity> roomsQuery = Query.newEntityQueryBuilder()
                .setKind(KIND_CHATROOM)
                .setFilter(PropertyFilter.hasAncestor(userKey))
                .build();

            QueryResults<Entity> rooms = datastore.run(roomsQuery);

            while (rooms.hasNext()) {
                Entity roomEntity = rooms.next();
                JSONObject roomObject = new JSONObject();

                roomObject.put(ChatWebSocket.JSON_ROOM_NAME,
                                roomEntity.getString(ROOM_ATTRIBUTE_NAME))
                          .put(ChatWebSocket.JSON_ROOM_ID,
                                ((Key) roomEntity.getKey()).getId());

                userRooms.put(roomObject);
            }

            userData.put(ChatWebSocket.JSON_ROOM_ARRAY, userRooms);
        }

        return userData.toString();
    }

    //TODO(lopezalexander) Remove on deploy
    public void createTestRoom(String roomName, String allowedUserId,
        String userName) {
        createUser(allowedUserId, userName);

        Key chatRoomKey = roomFactory.newKey(CapstoneAuth.TEST_ROOM_ID);
        Key childChatRoomKey = datastore.newKeyFactory()
                                        .setKind(KIND_CHATROOM)
                                        .addAncestor(PathElement.of(
                                            KIND_USERS, allowedUserId))
                                        .newKey(chatRoomKey.getId());

        Entity chatRoom = Entity.newBuilder(chatRoomKey)
                                .set(ROOM_ATTRIBUTE_NAME, roomName)
                                .build();
        Entity childChatRoom = Entity.newBuilder(childChatRoomKey)
                                     .set(ROOM_ATTRIBUTE_NAME, roomName)
                                     .build();

        datastore.put(chatRoom);
        datastore.put(childChatRoom);
    }

    /**
     * Verifies using datastore if the @param uid is allowed in the chatroom
     * @param chatRoomId .
     */
    public boolean isUserAllowedChatroom(String uid, long chatRoomId) {
        Key childChatRoomKey = datastore.newKeyFactory()
                                        .setKind(KIND_CHATROOM)
                                        .addAncestor(PathElement.of(
                                            KIND_USERS, uid))
                                        .newKey(chatRoomId);

        return (datastore.get(childChatRoomKey) != null);
    }

    /**
     * Gets the current instance of DatastoreManager. Creates one if it does not
     * exist.
     */
    public static DatastoreManager getInstance() {
        if (currentInstance == null) {
            currentInstance = new DatastoreManager();
        }

        return currentInstance;
    }
}
