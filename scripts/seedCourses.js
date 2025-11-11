const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cloudinary = require('../config/cloudinary');
const Course = require('../models/Course');
const coursesContent = require('../courseData');

dotenv.config();

const getCloudinaryUrl = async (searchTerm) => {
  try {

    const result = await cloudinary.search
      .expression(`public_id:${searchTerm}*`)
      .max_results(1)
      .execute();
    
    if (result.resources && result.resources.length > 0) {
      return result.resources[0].secure_url;
    }

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${searchTerm}`;
  } catch (error) {
    console.error(`Error fetching Cloudinary URL for ${searchTerm}:`, error);
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${searchTerm}`;
  }
};


const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');


    await Course.deleteMany({});
    console.log('Cleared existing courses');

    const coursesWithImages = await Promise.all(
      coursesContent.map(async (course) => {

        const imageName = course.image.split('/').pop();

        const imageUrl = await getCloudinaryUrl(imageName);
        
        console.log(`Processing ${course.title}: ${imageUrl}`);
        
        return {
          ...course,
          image: imageUrl,
          name: course.title
        };
      })
    );


    await Course.insertMany(coursesWithImages);
    console.log(`Successfully seeded ${coursesWithImages.length} courses`);

    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();