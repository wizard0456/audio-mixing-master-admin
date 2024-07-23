import React from 'react';

const Newsletter = () => {
  return (
    <div className="newsletter-page">
      <h1>Newsletter</h1>
      <p>Subscribe to our newsletter to stay updated with our latest news and offers.</p>
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit">Subscribe</button>
      </form>
    </div>
  );
};

export default Newsletter;
