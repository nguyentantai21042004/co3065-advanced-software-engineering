package com.aicoach.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

import com.aicoach.adapter.http.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * JWT Authentication Filter
 * Validates JWT token from Authorization header and sets authentication in
 * security context
 */
@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    @Autowired
    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            // Allow OPTIONS requests (CORS preflight) to pass through without
            // authentication
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = extractToken(request);

            if (token != null && jwtService.validateToken(token)) {
                // Token is valid, extract email and set authentication
                String email = jwtService.extractEmail(token);

                // Create authentication object
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("JWT token validated successfully for user: {}", email);
            } else if (token != null) {
                // Token exists but is invalid
                log.warn("Invalid or expired JWT token");
                handleUnauthorized(response, "Invalid or expired token");
                return;
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Error processing JWT token", e);
            handleUnauthorized(response, "Authentication error");
        }
    }

    /**
     * Extract JWT token from Authorization header
     * Format: "Bearer <token>"
     */
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }

    /**
     * Handle unauthorized access
     */
    private void handleUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        ApiResponse<?> errorResponse = ApiResponse.error(401, message);
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
