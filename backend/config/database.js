const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://hoangdinhnho23:nhohoang2k3@clusterquiz.bzbsxxe.mongodb.net/?retryWrites=true&w=majority&appName=ClusterQuiz', {
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log('MongoDB connected');

    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;