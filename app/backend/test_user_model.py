#!/usr/bin/env python3
"""
Test script for User model functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app, db, User

def test_user_creation():
    """Test user creation with valid data"""
    print("🧪 Testing user creation...")
    
    try:
        # Test valid user creation
        user = User(
            username="testuser",
            email="test@example.com",
            password="TestPass123!"
        )
        
        print("✅ User object created successfully")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Password hash: {user.password_hash[:20]}...")
        
        return user
        
    except ValueError as e:
        print(f"❌ User creation failed: {e}")
        return None

def test_password_validation():
    """Test password complexity validation"""
    print("\n🧪 Testing password validation...")
    
    # Test valid password
    try:
        user = User("testuser2", "test2@example.com", "ValidPass123!")
        print("✅ Valid password accepted")
    except ValueError as e:
        print(f"❌ Valid password rejected: {e}")
    
    # Test invalid passwords
    invalid_passwords = [
        "short",  # Too short
        "nouppercase123!",  # No uppercase
        "NOLOWERCASE123!",  # No lowercase
        "NoDigits!",  # No digits
        "NoSpecial123",  # No special characters
    ]
    
    for password in invalid_passwords:
        try:
            User("testuser3", "test3@example.com", password)
            print(f"❌ Invalid password '{password}' was accepted")
        except ValueError as e:
            print(f"✅ Invalid password '{password}' correctly rejected: {e}")

def test_password_checking():
    """Test password checking functionality"""
    print("\n🧪 Testing password checking...")
    
    user = User("testuser4", "test4@example.com", "TestPass123!")
    
    # Test correct password
    if user.check_password("TestPass123!"):
        print("✅ Correct password check passed")
    else:
        print("❌ Correct password check failed")
    
    # Test incorrect password
    if not user.check_password("WrongPassword123!"):
        print("✅ Incorrect password check passed")
    else:
        print("❌ Incorrect password check failed")

def test_validation_methods():
    """Test username and email validation methods"""
    print("\n🧪 Testing validation methods...")
    
    # Test username validation
    valid_usernames = ["user123", "test_user", "User123"]
    invalid_usernames = ["ab", "user@name", "user-name", ""]
    
    for username in valid_usernames:
        is_valid, message = User.validate_username(username)
        if is_valid:
            print(f"✅ Username '{username}' is valid")
        else:
            print(f"❌ Username '{username}' should be valid: {message}")
    
    for username in invalid_usernames:
        is_valid, message = User.validate_username(username)
        if not is_valid:
            print(f"✅ Username '{username}' correctly rejected: {message}")
        else:
            print(f"❌ Username '{username}' should be invalid")
    
    # Test email validation
    valid_emails = ["test@example.com", "user.name@domain.co.uk", "user+tag@example.org"]
    invalid_emails = ["invalid-email", "@example.com", "user@", "user@.com"]
    
    for email in valid_emails:
        is_valid, message = User.validate_email(email)
        if is_valid:
            print(f"✅ Email '{email}' is valid")
        else:
            print(f"❌ Email '{email}' should be valid: {message}")
    
    for email in invalid_emails:
        is_valid, message = User.validate_email(email)
        if not is_valid:
            print(f"✅ Email '{email}' correctly rejected: {message}")
        else:
            print(f"❌ Email '{email}' should be invalid")

def test_password_requirements():
    """Test password requirements method"""
    print("\n🧪 Testing password requirements...")
    
    requirements = User.get_password_requirements()
    print("Password requirements:")
    for key, value in requirements.items():
        print(f"   {key}: {value}")

def test_to_dict():
    """Test user serialization"""
    print("\n🧪 Testing user serialization...")
    
    user = User("testuser5", "test5@example.com", "TestPass123!")
    user_dict = user.to_dict()
    
    expected_keys = ['id', 'username', 'email', 'created_at', 'updated_at']
    for key in expected_keys:
        if key in user_dict:
            print(f"✅ Key '{key}' present in serialized data")
        else:
            print(f"❌ Key '{key}' missing from serialized data")
    
    # Check that password_hash is not included
    if 'password_hash' not in user_dict:
        print("✅ Password hash correctly excluded from serialized data")
    else:
        print("❌ Password hash should not be in serialized data")

def main():
    """Run all tests"""
    print("🚀 Starting User model tests...\n")
    
    with app.app_context():
        # Create database tables
        db.create_all()
        print("✅ Database tables created\n")
        
        # Run tests
        test_user_creation()
        test_password_validation()
        test_password_checking()
        test_validation_methods()
        test_password_requirements()
        test_to_dict()
        
        print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main() 