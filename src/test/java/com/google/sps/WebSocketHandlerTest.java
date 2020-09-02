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
import static org.junit.Assert.*;

import static org.mockito.Mockito.*;

public class WebSocketHandlerTest {

  static long TEST_ROOM_ID;
  static Session TEST_SESSION_1;
  static Session TEST_SESSION_2;
  static WebSocketHandler obj;

  @Before
  public void setUp() {
    TEST_SESSION_1 = mock(Session.class);
    TEST_SESSION_2 = mock(Session.class);
    TEST_ROOM_ID = 1;
    WebSocketHandler.resetInstance();
    obj = WebSocketHandler.getInstance();
  }

  @Test
  public void getInstance_CheckNewInstanceNotNull() {
    assertNotNull(obj);
  }

  @Test
  public void getInstance_WithExistingInstance() {
    WebSocketHandler result = WebSocketHandler.getInstance();

    assertEquals(result, obj);
  }

  @Test
  public void addSession_WithoutExistingRoom() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);
    
    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    assertEquals(actualList, expectedList);
  }

  @Test
  public void addSession_WithExistingRoom() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_2);

    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    expectedList.add(TEST_SESSION_2);
    assertEquals(actualList, expectedList);
  }

  @Test
  public void getRoomList_WithExistingRoom() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);

    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    assertEquals(actualList, expectedList);
  }

  @Test
  public void getRoomList_WithNewRoom() {
    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    assertNull(actualList);
  }

  @Test
  public void removeSession_SessionsLeft() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_2);

    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_1);
    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_2);
    assertEquals(actualList, expectedList);
  }

  @Test
  public void removeSession_NoSessionsLeft() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);
    boolean success = false;

    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_1);
    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    assertNull(actualList);
  }

  @Test
  public void removeSession_InvalidSession() {
    obj.addSession(TEST_ROOM_ID, TEST_SESSION_1);

    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_2);
    List<Session> actualList = obj.getRoomList(TEST_ROOM_ID);

    List<Session> expectedList = new ArrayList<>();
    expectedList.add(TEST_SESSION_1);
    assertEquals(actualList, expectedList);
  }

  @Test (expected = NullPointerException.class)
  public void removeSession_InvalidRoom() {
    obj.removeSession(TEST_ROOM_ID, TEST_SESSION_1);
  }
}
