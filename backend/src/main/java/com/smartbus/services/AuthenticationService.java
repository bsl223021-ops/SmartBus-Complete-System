package com.smartbus.services;

import com.smartbus.config.JwtAuthenticationConfig;
import com.smartbus.dto.LoginRequest;
import com.smartbus.dto.LoginResponse;
import com.smartbus.dto.RegisterRequest;
import com.smartbus.dto.UserDto;
import com.smartbus.exceptions.CustomException;
import com.smartbus.models.User;
import com.smartbus.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthenticationConfig jwtConfig;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtConfig.generateToken(userDetails);

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }

    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
        user.setActive(true);
        user.setCreatedAt(System.currentTimeMillis());

        User savedUser = userRepository.save(user);
        return userService.toDto(savedUser);
    }

    public boolean validateToken(String token) {
        try {
            String email = jwtConfig.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            return jwtConfig.isTokenValid(token, userDetails);
        } catch (Exception e) {
            return false;
        }
    }
}
