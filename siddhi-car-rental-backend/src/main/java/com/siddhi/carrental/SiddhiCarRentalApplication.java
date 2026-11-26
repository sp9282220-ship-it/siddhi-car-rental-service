package com.siddhi.carrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

import java.io.File;

// We use our own token login, so Spring's default in-memory user is switched off
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class SiddhiCarRentalApplication {

    public static void main(String[] args) {
        fixWindowsSocketTempDir();
        SpringApplication.run(SiddhiCarRentalApplication.class, args);
    }

    /*
     * On Windows, Java 17 creates a small local socket file in the TEMP folder for its network
     * selector. Some Windows machines (security policies / antivirus) block these sockets inside
     * %TEMP%, and Tomcat then fails with "Unable to establish loopback connection".
     * Using a folder in the user's home directory avoids that problem. Harmless elsewhere.
     */
    private static void fixWindowsSocketTempDir() {
        if (!System.getProperty("os.name", "").toLowerCase().contains("win")) return;
        if (System.getProperty("jdk.net.unixdomain.tmpdir") != null) return;
        File dir = new File(System.getProperty("user.home"), ".siddhi-car-rental");
        if (dir.isDirectory() || dir.mkdirs()) {
            System.setProperty("jdk.net.unixdomain.tmpdir", dir.getAbsolutePath());
        }
    }
}
