package com.google.sps;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import static org.junit.Assert.assertEquals;

import static org.mockito.Mockito.*;

import com.google.cloud.datastore.testing.LocalDatastoreHelper;

import com.google.sps.DatastoreManager;

public class DatastoreManagerTest {

    LocalDatastoreHelper datastoreHelper =
            LocalDatastoreHelper.newBuilder()
                                .setConsistency(0.9)
                                .setPort(8081)
                                .setStoreOnDisk(false)
                                .build();

    @Before
    public void setUp() throws IOException, InterruptedException {
        datastoreHelper.start();
    }

    @After
    public void tearDown() throws IOException, InterruptedException,
            TimeoutException{
        datastoreHelper.stop();
    }

    @Test
    public void checkCreateUser() {
        String uid = "testuid";
        String name = "Test User";
        String email = "test@example.com";

        DatastoreManager.getInstance().createUser(uid, name);

        assertEquals(name, DatastoreManager.getInstance().getUserName(uid));
    }

    @Test
    public void checkGetInstance() {
        boolean isNull = (DatastoreManager.getInstance() == null);

        assertEquals(false, isNull);
    }
}
