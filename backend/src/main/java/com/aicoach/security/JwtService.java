package com.aicoach.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 giờ

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Validate JWT token - check if token is valid and not expired
     * 
     * @param token JWT token string
     * @return true if token is valid and not expired, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            // Token expired
            return false;
        } catch (MalformedJwtException e) {
            // Token malformed
            return false;
        } catch (UnsupportedJwtException e) {
            // Token unsupported
            return false;
        } catch (SecurityException e) {
            // Invalid signature
            return false;
        } catch (IllegalArgumentException e) {
            // Token is empty or null
            return false;
        } catch (Exception e) {
            // Any other exception
            return false;
        }
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token string
     * @return true if token is expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = Jwts.parser().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody().getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            return true; // If we can't parse, consider it expired
        }
    }
}
