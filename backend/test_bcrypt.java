import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class test_bcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String adminHash = "$2a$10$DzD9.Zxxye3Z0Fa6zA1Ew.zeg4U8SxleS/DI99MMvFIbBDln7um0G";
        String testPassword = "admin";
        
        boolean matches = encoder.matches(testPassword, adminHash);
        System.out.println("Password 'admin' matches hash: " + matches);
    }
}
