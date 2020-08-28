package com.google.sps;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import org.junit.Test;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.AfterClass;
import org.junit.runner.RunWith;
import static org.junit.Assert.assertEquals;

import static org.mockito.Mockito.*;

import org.json.JSONObject;
import org.json.JSONArray;

import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.powermock.api.mockito.PowerMockito;

import com.google.cloud.Timestamp;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreOptions;
import com.google.cloud.datastore.Entity;
import com.google.cloud.datastore.KeyFactory;
import com.google.cloud.datastore.Key;
import com.google.cloud.datastore.PathElement;
import com.google.cloud.datastore.TimestampValue;
import com.google.cloud.datastore.testing.LocalDatastoreHelper;

import com.google.sps.DatastoreManager;
import static com.google.sps.DatastoreManager.*;
import static com.google.sps.ChatWebSocket.*;
import com.google.sps.CapstoneAuth;

@PrepareForTest({CapstoneAuth.class, Timestamp.class})
@RunWith(PowerMockRunner.class)
public class DatastoreManagerTest {

    private static LocalDatastoreHelper datastoreHelper =
            LocalDatastoreHelper.newBuilder()
                                .setConsistency(0.9)
                                .setPort(8081)
                                .setStoreOnDisk(false)
                                .build();

    private static Datastore datastore;
    private static KeyFactory userFactory;
    private static KeyFactory roomFactory;

    private static final String TEST_NAME = "Test User";
    private static final String TEST_UID = "testuser";
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_ROOM_NAME = "Test Room";
    public static final String TEST_THREAD = "testing";
    public static final String TEST_COLOR = "red";

    @BeforeClass
    public static void setupDatastore() throws IOException,
            InterruptedException {
        datastoreHelper.start();

        datastore = DatastoreOptions.newBuilder()
                                    .setProjectId("chap-2020-capstone")
                                    .setHost("localhost:8081")
                                    .build()
                                    .getService();
        userFactory = datastore.newKeyFactory()
                               .setKind(KIND_USERS);
        roomFactory = datastore.newKeyFactory()
                               .setKind(KIND_CHATROOM);

        getInstance(true);
    }

    @AfterClass
    public static void teardownDatastore() throws IOException,
            InterruptedException, TimeoutException {
        datastoreHelper.stop();
    }

    @Before
    public void setUp() throws IOException {
        datastoreHelper.reset();
    }

    @Test
    public void checkLoadChatHistory_returnsStringWithAllContent() {
        String[] copyItems = {JSON_USER_ID, JSON_MESSAGE, JSON_USER_NAME,
                              JSON_THREAD};

        datastore.put(createRoomEntity(TEST_ROOM_NAME, 1));
        datastore.put(createUserEntity(TEST_UID, TEST_NAME, TEST_EMAIL));
        datastore.put(createChildRoomEntity(1, TEST_UID, TEST_ROOM_NAME));

        JSONArray expectedArray = new JSONArray();

        JSONObject messageData = getStandardChatNew();
        messageData.put(JSON_USER_NAME, TEST_NAME);
        Key currentKey;

        for (int i = 0; i < 3; i++) {
            messageData = new JSONObject(messageData, copyItems);
            messageData.put(JSON_MESSAGE, "Test " + i);
            currentKey = createMessageKey(1);

            datastore.put(createMessageEntity(messageData, currentKey,
                TimestampValue.of(Timestamp.now())));

            expectedArray.put(messageData);
        }

        JSONArray messageHistory =
            new JSONArray(getInstance().loadChatHistory(1));

        assertEquals(true, messageHistory.similar(expectedArray));
    }

    @Test
    public void checkLoadMarkerData_returnsStringWithAllContent() {
        String[] copyItems = {JSON_TITLE, JSON_BODY, JSON_LONGITUDE,
                JSON_LATITUDE, JSON_COLOR};

        datastore.put(createRoomEntity(TEST_ROOM_NAME, 1));

        JSONArray expectedArray = new JSONArray();

        JSONObject markerData = getStandardMarkerNew();
        Key currentKey = createMarkerKey(1);

        datastore.put(createMarkerEntity(currentKey, markerData));
        markerData.put(JSON_ID, currentKey.getId());
        expectedArray.put(markerData);

        markerData = new JSONObject(markerData, copyItems);
        currentKey = createMarkerKey(1);
        markerData.put(JSON_TITLE, "Title2");
        markerData.put(JSON_LATITUDE, 2.5);
        datastore.put(createMarkerEntity(currentKey, markerData));
        markerData.put(JSON_ID, currentKey.getId());
        expectedArray.put(markerData);

        markerData = new JSONObject(markerData, copyItems);
        currentKey = createMarkerKey(1);
        markerData.put(JSON_TITLE, "Title3");
        markerData.put(JSON_LATITUDE, 3.5);
        datastore.put(createMarkerEntity(currentKey, markerData));
        markerData.put(JSON_ID, currentKey.getId());
        expectedArray.put(markerData);

        JSONArray markerHistory =
            new JSONArray(getInstance().loadMarkerData(1));

        boolean arraysEqual = true;

        for (int i = 0; i < markerHistory.length(); i++) {
            boolean overlap = false;
            JSONObject currentObject = markerHistory.getJSONObject(i);

            for (int j = 0; j < expectedArray.length(); j++) {
                if (currentObject.similar(expectedArray.getJSONObject(j))) {
                    overlap = true;
                    break;
                }
            }

            if (!overlap) {
                arraysEqual = false;
                break;
            }
        }

        assertEquals(true, arraysEqual);
    }

    @Test
    public void checkAddMessage_placesMessageEntityInDatastore() {
        Timestamp currentTime = Timestamp.now();
        PowerMockito.spy(Timestamp.class);
        when(Timestamp.now()).thenReturn(currentTime);

        datastore.put(createRoomEntity(TEST_ROOM_NAME, 1));

        JSONObject messageData = getStandardChatNew();
        Key messageKey = getInstance().addMessage(1, messageData);
        Entity testEntity = createMessageEntity(messageData, messageKey,
            TimestampValue.of(currentTime));
        assertEquals(testEntity, datastore.get(messageKey));
    }

    @Test
    public void checkDeleteMarker_markerEntityIsDeletedFromDatastore() {
        datastore.put(createRoomEntity(TEST_ROOM_NAME, 1));

        Key markerKey = createMarkerKey(1);
        datastore.put(createMarkerEntity(markerKey, getStandardMarkerNew()));
        getInstance().deleteMarker(1, markerKey.getId());

        assertEquals(null, datastore.get(markerKey));
    }

    @Test
    public void checkUpdateMarker_correctMarkerEntityInDatastore() {
        datastore.put(createRoomEntity(TEST_ROOM_NAME, 1));

        JSONObject markerJson = getStandardMarkerNew();
        Key setMarkerKey = createMarkerKey(1);
        datastore.put(createMarkerEntity(setMarkerKey, markerJson));

        markerJson.put(JSON_TITLE, "Hello!");
        markerJson.put(JSON_ID, setMarkerKey.getId());
        getInstance().updateMarker(1, markerJson);

        assertEquals(createMarkerEntity(setMarkerKey, markerJson),
            datastore.get(setMarkerKey));
    }

    @Test
    public void checkAddMarker_placesMarkerEntityInDatastore() {
        long roomId = 1;
        Entity roomEntity = createRoomEntity(TEST_ROOM_NAME, roomId);
        datastore.put(roomEntity);

        JSONObject markerData = getStandardMarkerNew();
        Key markerKey = createMarkerKey(roomId);

        long returnedId = getInstance().addMarker(markerKey, markerData);

        assertEquals(createMarkerEntity(markerKey, markerData),
            datastore.get(markerKey));
    }

    @Test
    public void checkGetUserName_returnsCorrectUserName() {
        datastore.put(createUserEntity(TEST_UID, TEST_NAME, TEST_EMAIL));

        assertEquals(TEST_NAME, getInstance().getUserName(TEST_UID));
    }

    @Test
    public void checkCreateChatRoom_roomEntitiesAddedToDatastore() {
        datastore.put(createUserEntity(TEST_UID, TEST_NAME, TEST_EMAIL));
        long roomId = getInstance().createChatRoom(TEST_ROOM_NAME, TEST_UID);

        Entity roomEntity = createRoomEntity(TEST_ROOM_NAME, roomId);
        Entity childEntity = createChildRoomEntity(roomId, TEST_UID,
            TEST_ROOM_NAME);

        assertEquals(roomEntity, datastore.get(roomEntity.getKey()));
        assertEquals(childEntity, datastore.get(childEntity.getKey()));
    }

    @Test
    public void checkUserAllowedChatroom_returnsTrue() {
        long roomId = 1;

        datastore.put(createRoomEntity(TEST_ROOM_NAME, roomId),
                      createUserEntity(TEST_UID, TEST_NAME, TEST_EMAIL),
                      createChildRoomEntity(roomId, TEST_UID, TEST_ROOM_NAME));

        assertEquals(true,
            getInstance().isUserAllowedChatroom(TEST_UID, roomId));
    }

    @Test
    public void checkAddUserToChatRoom_keyIndicatorExistsInDatastore() {
        String addUid = "testuidadd";
        String addName = "Add User";
        String addEmail = "add@example.com";

        long roomId = 1;

        datastore.put(createRoomEntity(TEST_ROOM_NAME, roomId),
                      createUserEntity(TEST_UID, TEST_NAME, TEST_EMAIL),
                      createChildRoomEntity(roomId, TEST_UID, TEST_ROOM_NAME),
                      createUserEntity(addUid, addName, addEmail));

        getInstance().addUserToChatRoom(roomId, addEmail);

        Key childChatRoomKey = datastore.newKeyFactory()
                                        .setKind(KIND_CHATROOM)
                                        .addAncestor(PathElement.of(
                                            KIND_USERS, addUid))
                                        .newKey(roomId);

        assertEquals(true, datastore.get(childChatRoomKey) != null);
    }

    @Test
    public void checkCreateUser_properUserEntityExistsInDatastore() {
        PowerMockito.mockStatic(CapstoneAuth.class);
        when(CapstoneAuth.getUserEmail(TEST_UID)).thenReturn(TEST_EMAIL);

        getInstance().createUser(TEST_UID, TEST_NAME);

        PowerMockito.verifyStatic(CapstoneAuth.class);
        CapstoneAuth.getUserEmail(TEST_UID);

        Entity userEntity = createUserEntity(TEST_UID, TEST_NAME, TEST_EMAIL);

        Entity storedEntity = datastore.get(userEntity.getKey());

        assertEquals(userEntity, storedEntity);
    }

    @Test
    public void checkGetInstance_isNotNull() {
        boolean isNull = (getInstance() == null);

        assertEquals(false, isNull);
    }

    private static JSONObject getStandardMarkerNew() {
        return (new JSONObject()).put(JSON_TITLE, "Title")
                                 .put(JSON_BODY, "Body")
                                 .put(JSON_LATITUDE, 1.5)
                                 .put(JSON_LONGITUDE, -0.3)
                                 .put(JSON_COLOR, TEST_COLOR);
    }

    private static JSONObject getStandardChatNew() {
        return (new JSONObject()).put(JSON_USER_ID, TEST_UID)
                                 .put(JSON_MESSAGE, "Test")
                                 .put(JSON_THREAD, TEST_THREAD);
    }

    private Entity createMessageEntity(JSONObject messageData,
            Key messageKey, TimestampValue timeStamp) {
        return Entity.newBuilder(messageKey)
                     .set(JSON_USER_ID, messageData.getString(JSON_USER_ID))
                     .set(JSON_MESSAGE, messageData.getString(JSON_MESSAGE))
                     .set(JSON_TIMESTAMP, timeStamp)
                     .set(JSON_THREAD, TEST_THREAD)
                     .build();
    }

    private Key createMessageKey(long roomId) {
        KeyFactory chatHistoryFactory =
            datastore.newKeyFactory()
                     .setKind(KIND_CHATROOM_HISTORY)
                     .addAncestor(PathElement.of(KIND_CHATROOM, roomId));

        return datastore.allocateId(chatHistoryFactory.newKey());
    }

    private Key createMarkerKey(long roomId) {
        return datastore.allocateId(datastore.newKeyFactory()
                        .setKind(KIND_CHATROOM_MARKERS)
                        .addAncestor(PathElement.of(
                            KIND_CHATROOM, roomId))
                        .newKey());
    }

    private Entity createMarkerEntity(Key markerKey, JSONObject markerData) {
        Entity markerEntity = Entity.newBuilder(markerKey)
                                    .set(JSON_TITLE,
                                        markerData.getString(JSON_TITLE))
                                    .set(JSON_BODY,
                                        markerData.getString(JSON_BODY))
                                    .set(JSON_LATITUDE,
                                        markerData.getDouble(JSON_LATITUDE))
                                    .set(JSON_LONGITUDE,
                                        markerData.getDouble(JSON_LONGITUDE))
                                    .set(JSON_COLOR, TEST_COLOR)
                                    .build();

        return markerEntity;
    }

    private Entity createRoomEntity(String roomName, long roomId) {
        Entity returnEntity = Entity.newBuilder(roomFactory.newKey(roomId))
                                    .set(ROOM_ATTRIBUTE_NAME, roomName)
                                    .build();
        return returnEntity;
    }

    private Entity createChildRoomEntity(long roomId, String parentUid,
            String roomName) {
        Key childRoomKey = datastore.newKeyFactory()
                                    .setKind(KIND_CHATROOM)
                                    .addAncestor(PathElement.of(KIND_USERS,
                                        parentUid))
                                    .newKey(roomId);

        Entity returnEntity = Entity.newBuilder(childRoomKey)
                                    .set(ROOM_ATTRIBUTE_NAME, roomName)
                                    .set(CHILD_ROOM_ATTRIBUTE_ID, roomId)
                                    .build();

        return returnEntity;
    }

    private Entity createUserEntity(String uid, String name,
            String email) {
        Entity returnEntity = Entity.newBuilder(userFactory.newKey(uid))
                                    .set(USER_ATTRIBUTE_NAME,
                                        name)
                                    .set(USER_ATTRIBUTE_EMAIL,
                                        email)
                                    .build();
        return returnEntity;
    }
}
