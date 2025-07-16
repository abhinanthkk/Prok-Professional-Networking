### Database (Conceptual - SQLite with Flask-SQLAlchemy)

This section outlines the conceptual database schema for the Prok Professional Networking App, designed for a tutorial context. The primary focus is on fundamental data relationships, not production-level scaling or advanced optimizations.

**Technical Stack:**

* **Database System:** SQLite (for simplicity and ease of setup in a tutorial)
* **ORM (Object-Relational Mapper):** Flask-SQLAlchemy (Python)

**Conceptual Schema:**

Here are the proposed database tables and their key fields, along with relationships:

#### 1. User Table

* **Purpose:** Stores information about registered users of the application.
* **Fields:**
    * `id`: INTEGER PRIMARY KEY - Unique identifier for each user.
    * `username`: TEXT UNIQUE NOT NULL - User's unique display name.
    * `email`: TEXT UNIQUE NOT NULL - User's email address, also unique.
    * `password_hash`: TEXT NOT NULL - Hashed version of the user's password (for security, never store plain passwords).
    * `bio`: TEXT - (Nullable) A short description or autobiography for the user's profile.
    * `skills`: TEXT - (Nullable) A comma-separated string or JSON string of skills.

#### 2. P
* **Purpose:** Stores all user-generated content fost Table
or the feed.
* **Fields:**
    * `id`: INTEGER PRIMARY KEY - Unique identifier for each post.
    * `content`: TEXT NOT NULL - The main text content of the post.
    * `user_id`: INTEGER NOT NULL - Foreign Key referencing `User.id`. Identifies the author of the post.
    * `timestamp`: DATETIME NOT NULL - The date and time when the post was created.

#### 3. Job Table

* **Purpose:** Stores details about job postings available on the job board.
* **Fields:**
    * `id`: INTEGER PRIMARY KEY - Unique identifier for each job posting.
    * `title`: TEXT NOT NULL - The title of the job (e.g., "Software Engineer").
    * `company`: TEXT NOT NULL - The name of the company offering the job.
    * `location`: TEXT NOT NULL - The geographical location of the job.
    * `description`: TEXT NOT NULL - A detailed description of the job responsibilities and requirements.

#### 4. Application Table

* **Purpose:** Records instances of users applying for jobs.
* **Fields:**
    * `id`: INTEGER PRIMARY KEY - Unique identifier for each application.
    * `job_id`: INTEGER NOT NULL - Foreign Key referencing `Job.id`. Identifies the job being applied for.
    * `user_id`: INTEGER NOT NULL - Foreign Key referencing `User.id`. Identifies the user who submitted the application.
    * `applicant_name`: TEXT NOT NULL - The name provided by the applicant (could default to user's name).
    * `applicant_email`: TEXT NOT NULL - The email provided by the applicant (could default to user's email).
    * `resume_link`: TEXT - (Nullable) A URL to the applicant's resume.
    * `timestamp`: DATETIME NOT NULL - The date and time when the application was submitted.

#### 5. Message Table

* **Purpose:** Stores individual messages exchanged between users.
* **Fields:**
    * `id`: INTEGER PRIMARY KEY - Unique identifier for each message.
    * `sender_id`: INTEGER NOT NULL - Foreign Key referencing `User.id`. Identifies the user who sent the message.
    * `recipient_id`: INTEGER NOT NULL - Foreign Key referencing `User.id`. Identifies the user who received the message.
    * `content`: TEXT NOT NULL - The text content of the message.
    * `timestamp`: DATETIME NOT NULL - The date and time when the message was sent.

-- Prok Professional Networking App Database Schema
-- SQLite with Flask-SQLAlchemy

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'company')) DEFAULT 'user',
    bio TEXT,
    skills TEXT,
    profile_picture TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    industry TEXT,
    company_size TEXT,
    location TEXT,
    logo TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Posts Table
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Likes Table
CREATE TABLE likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- User Connections Table
CREATE TABLE user_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs Table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
    salary_range TEXT,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Job Applications Table
CREATE TABLE job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    resume_link TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('connection', 'message', 'like', 'comment', 'job_application')),
    reference_id INTEGER NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for frequently queried fields
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_posts_timestamp 
AFTER UPDATE ON posts
BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_comments_timestamp 
AFTER UPDATE ON comments
BEGIN
    UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_user_connections_timestamp 
AFTER UPDATE ON user_connections
BEGIN
    UPDATE user_connections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_jobs_timestamp 
AFTER UPDATE ON jobs
BEGIN
    UPDATE jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_job_applications_timestamp 
AFTER UPDATE ON job_applications
BEGIN
    UPDATE job_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;