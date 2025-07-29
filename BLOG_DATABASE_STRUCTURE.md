# Blog Database Structure

## Required Database Tables

### 1. blog_categories Table
```sql
CREATE TABLE blog_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. blogs Table
```sql
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    read_time VARCHAR(50) NOT NULL,
    keywords TEXT,
    content LONGTEXT,
    html_file_path VARCHAR(500),
    category_id INT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL
);
```

## API Endpoints Required

### Blog Categories
- `GET /api/admin/blog-categories` - Get all categories
- `POST /api/admin/blog-categories` - Create new category
- `PUT /api/admin/blog-categories/{id}` - Update category
- `DELETE /api/admin/blog-categories/{id}` - Delete category

### Blogs
- `GET /api/admin/blogs` - Get all blogs with pagination
- `GET /api/admin/blogs/{id}` - Get specific blog
- `POST /api/admin/blogs` - Create new blog
- `PUT /api/admin/blogs/{id}` - Update blog
- `DELETE /api/admin/blogs/{id}` - Delete blog
- `PUT /api/admin/blogs/{id}/status` - Update blog status

## Sample Data for Categories
```sql
INSERT INTO blog_categories (name, slug, description) VALUES
('Audio Mixing', 'audio-mixing', 'Articles about audio mixing techniques'),
('Music Production', 'music-production', 'Music production tips and tutorials'),
('Studio Equipment', 'studio-equipment', 'Reviews and guides for studio equipment'),
('Industry News', 'industry-news', 'Latest news from the music industry'),
('Tutorials', 'tutorials', 'Step-by-step tutorials and guides');
```

## File Upload Configuration
- HTML files should be stored in a designated folder (e.g., `/public/blog-html/`)
- File naming convention: `{blog_id}_{timestamp}.html`
- Maximum file size: 10MB
- Allowed file types: .html, .htm

## Features Implemented in Frontend

### Blog Management Page Features:
1. **List all blogs** with pagination
2. **Filter blogs** by status (All, Active, Inactive)
3. **Add new blog** with:
   - Title
   - Author name
   - Publish date
   - Read time
   - Keywords (for SEO)
   - Category selection
   - Rich text content editor
   - HTML file upload
   - Active/Inactive status
4. **Edit existing blogs**
5. **Delete blogs** with confirmation
6. **View blog details** in modal
7. **Toggle blog status** (Active/Inactive)

### Form Validation:
- Required fields: Title, Author, Publish Date, Read Time, Category
- Optional fields: Keywords, HTML file
- Date validation for publish date
- File type validation for HTML uploads

### UI/UX Features:
- Responsive design
- Loading states
- Error handling
- Success/error notifications
- Confirmation modals for destructive actions
- Rich text editor for content
- File upload with preview
- Status toggle with immediate feedback

## Security Considerations:
- Admin-only access to blog management
- File upload validation
- XSS protection for content
- CSRF protection for forms
- Proper authentication checks

## SEO Features:
- Keywords field for meta tags
- SEO-friendly URLs (slugs)
- Structured data support
- Meta description and title fields 