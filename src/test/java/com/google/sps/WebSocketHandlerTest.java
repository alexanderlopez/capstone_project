package com.google.sps;

import com.google.sps.WebSocketHandler;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import javax.websocket.Session;

import org.junit.Test;
import org.junit.Before;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNotNull;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;

import static org.mockito.Mockito.*;

public class WebSocketHandlerTest {

  Constructor constructor;
  Field instance;
  Field chatRoomMap;
  WebSocketHandler obj;
  Map<Long, List<Session>> actualMap;

  static long TEST_ROOM_ID;
  static Session TEST_SESSION_1;
  static Session TEST_SESSION_2;

  @Before
  public void setUp() throws NoSuchFieldException, NoSuchMethodException, InstantiationException, IllegalAccessException, InvocationTargetException {
    TEST_SESSION_1 = mock(Session.class);
    TEST_SESSION_2 = mock(Session.class);
    TEST_ROOM_ID = 1;

    constructor = WebSocketHandler.class.getDeclaredConstructor();
    constructor.setAccessible(true);

    instance = WebSocketHandler.class.getDeclaredField("instance");
    instance.setAccessible(true);

    chatRoomMap = WebSocketHandler.class.getDeclaredField("chatRoomMap");
    chatRoomMap.setAccessible(true);

    obj = (WebSocketHandler) constructor.newInstance();

    actualMap = (Map)chatRoomMap.get(obj);
  }

  @Test
  public void getInstance_CheckNewInstanceNotNull() throws NoSuchMethodException, IllegalAccessException {

    WebSocketHandler newInstance = WebSocketHandler.getInstance();

    WebSocketHandler result = (WebSocketHandler)instance.get(null);
    assertEquals(newInstance, result);
    assertNotNull(result);
  }

  @Test
  public void getInstance_WithExistingInstance() throws InstantiationException, IllegalAccessException, InvocationTargetException {
    instance.set(null, obj);

    WebSocketHandler result = WebSocketHandler.getInstance();

    assertEquals(result, obj);
  }

  @Test
  public void addSession_WithoutExistingRoom() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);

    Map<Long, List<Session>> expectedMap = new HashMap<>();
    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    expectedMap.put(TEST_ROOM_ID, expectedList);
    assertEquals(actualMap, expectedMap);
  }

  @Test
  public void addSession_WithExistingRoom() {
    List<Session> preSetList = new ArrayList<>();
    preSetList.add(TEST_SESSION_1);
    actualMap.put(TEST_ROOM_ID, preSetList);

    obj.addSession(TEST_ROOM_ID, TEST_SESSION_2);

    Map<Long, List<Session>> expectedMap = new HashMap<>();
    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    expectedList.add(TEST_SESSION_2);
    expectedMap.put(TEST_ROOM_ID, expectedList);
    assertEquals(actualMap, expectedMap);
  }

  @Test
  public void getRoomList_WithExistingRoom() {
    actualMap.put(TEST_ROOM_ID, new ArrayList<>());

    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    List<Session> expectedList =
        Collections.unmodifiableList(new ArrayList<>());
    assertEquals(actualList, expectedList);
  }

  @Test
  public void getRoomList_WithNewRoom() {
    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    assertEquals(actualList, null);
  }

  @Test
  public void removeSession_SessionsLeft() {
    List<Session> actualList = new ArrayList<>();
    actualList.add(TEST_SESSION_1);
    actualList.add(TEST_SESSION_2);
    actualMap.put(TEST_ROOM_ID, actualList);

    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_1);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_2);
    assertEquals(actualList, expectedList);
  }

  @Test
  public void removeSession_NoSessionsLeft() {
    List<Session> actualList = new ArrayList<>();
    actualList.add(TEST_SESSION_1);
    actualMap.put(TEST_ROOM_ID, actualList);

    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_1);

    Map<Long, List<Session>> expectedMap = new HashMap<>();
    assertEquals(actualMap, expectedMap);
  }

  @Test
  public void removeSession_InvalidSession() {
    List<Session> actualList = new ArrayList<>();
    actualList.add(TEST_SESSION_1);
    actualMap.put(TEST_ROOM_ID, actualList);

    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_2);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    assertEquals(actualList, expectedList);
  }

  @Test
  public void removeSession_InvalidRoom() {
    boolean success = false;

    try {
      obj.removeSession(TEST_ROOM_ID, TEST_SESSION_1);
    } catch (NullPointerException e){
      success = true;
    }

    assertTrue(success);
  }
}
