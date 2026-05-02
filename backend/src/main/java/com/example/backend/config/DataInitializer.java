package com.example.backend.config;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDefaultAdmin(UserRepository userRepository) {
        return args -> {
            // Always ensure a default admin account exists on startup
            if (userRepository.findFirstByEmail("admin@disaster.com").isEmpty()) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@disaster.com");
                admin.setPassword("Admin@123");
                admin.setRole("admin");
                userRepository.save(admin);
                System.out.println("✅ Default admin account seeded: admin@disaster.com / Admin@123");
            }
        };
    }
}
