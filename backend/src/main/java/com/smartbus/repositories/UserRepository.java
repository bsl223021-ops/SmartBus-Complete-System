package com.smartbus.repositories;

import com.smartbus.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(User.UserRole role);
    java.util.List<User> findByActive(Boolean active);
}
