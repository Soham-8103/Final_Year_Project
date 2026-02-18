const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  const { query, location } = req.query;

  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: `${query} in ${location}`,
      page: '1',
      num_pages: '1'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    
    // Normalizing the data
    const jobs = response.data.data.map(job => ({
      company: job.employer_name || "N/A",
      title: job.job_title || "N/A",
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : "Remote",
      salary: job.job_highlights?.Qualifications ? "See Description" : "Not Disclosed",
      website: job.job_publisher || "Direct",
      date: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : "Recent",
      link: job.job_apply_link
    }));

    res.json({ success: true, jobs });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching jobs" });
  }
});

module.exports = router;