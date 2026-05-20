import React, { useState } from "react";

const img1 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258548/Flow1_ya2csh.png";
const img2 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/v1779258545/chatbot1_rktcai.png";
const img3 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/v1779258546/chatbot2_qbtj93.png";
const img4 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/v1779258547/chatbot3_zhyde2.png";
const img5 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258546/chatbot4_z9jn83.png";
const img6 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/v1779258550/LSTM1_xmzfyp.png";
const img7 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258550/LSTM2_grd70w.png";
const img8 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258548/dashboard_wx5c3m.png";
const img9 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258555/YOLO_lxyvmj.png";
const img10 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258168/Tagimage_kc9pyd.png";
const img11 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258168/TagImage2_gdo9he.png";
const img12 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258169/TagImage3_t75ujb.png";
const img13 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258169/Tagimage4_icb05s.png";
const img14 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258552/view1_eeppgd.png";
const img15 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258553/view2_whebxm.png";
const img16 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258553/view3_ap0aum.png";
const img17 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258554/view4_s1hpbx.png";
const img18 =
  "https://res.cloudinary.com/dvf2bl8co/image/upload/q_auto/f_auto/v1779258553/view5_pmgukw.png";

const ImagesView = () => {
  const images = [
    {
      src: img1,
      title: "System Architecture",
      description: "Main System Architecture Diagram.",
    },
    {
      src: img2,
      title: "AgriChatbot Architecture",
      description: "Architecture of the AgriChatbot system.",
    },
    {
      src: img3,
      title: "AgriChatbot Training",
      description: "Training process of AgriChatbot model.",
    },
    {
      src: img4,
      title: "AgriChatbot Backend",
      description: "Backend architecture of the AgriChatbot system.",
    },
    {
      src: img5,
      title: "AgriChatbot Forecasting",
      description: "Data-driven forecasting system.",
    },
    {
      src: img6,
      title: "LSTM Model Architecture",
      description: "Architecture of the LSTM model used for crop prediction.",
    },
    {
      src: img7,
      title: "LSTM Model Training Process",
      description: "Training process of the LSTM model.",
    },
    {
      src: img8,
      title: "Dashboard Overview",
      description: "User interface of the project dashboard.",
    },
    {
      src: img9,
      title: "YOLO Model for Object Detection",
      description: "Architecture of the YOLO model used for object detection.",
    },
    {
      src: img10,
      title: "Image Tagging Example 1",
      description: "Example of image tagging in the system.",
    },
    {
      src: img11,
      title: "Image Tagging Example 2",
      description: "Another example of image tagging in the system.",
    },
    {
      src: img12,
      title: "Image Tagging Example 3",
      description: "Further example of image tagging in the system.",
    },
    {
      src: img13,
      title: "Image Tagging Example 4",
      description: "Additional example of image tagging in the system.",
    },
    {
      src: img14,
      title: "Data Visualization View 1",
      description: "First view of data visualization in the dashboard.",
    },
    {
      src: img15,
      title: "Data Visualization View 2",
      description: "Second view of data visualization in the dashboard.",
    },
    {
      src: img16,
      title: "Data Visualization View 3",
      description: "Third view of data visualization in the dashboard.",
    },
    {
      src: img17,
      title: "Data Visualization View 4",
      description: "Fourth view of data visualization in the dashboard.",
    },
    {
      src: img18,
      title: "Data Visualization View 5",
      description: "Fifth view of data visualization in the dashboard.",
    },
  ];

  // Divide images uniquely across sections
  const leftImages = images.slice(0, 6);
  const rightImages = images.slice(6, 12);
  const bottomImages = images.slice(12, 18);

  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-green-900 py-10 px-6 lg:px-10">
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
        Project Image Gallery
      </h1>

      {/* Main 3-Side Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6">
          {leftImages.map((image, index) => (
            <div
              key={`left-${index}`}
              onClick={() => setSelectedImage(image)}
              className={`cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transform hover:scale-[1.03] transition-all ${
                selectedImage.src === image.src ? "ring-4 ring-green-500" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-40 object-cover"
              />
            </div>
          ))}
        </div>

        {/* Center Main Image */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8">
          <div className="w-full max-w-3xl h-[500px] overflow-hidden rounded-xl shadow-lg mb-6">
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              className="w-full h-full object-contain bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedImage.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl">
            {selectedImage.description}
          </p>
        </div>

        {/* Right Sidebar */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6">
          {rightImages.map((image, index) => (
            <div
              key={`right-${index}`}
              onClick={() => setSelectedImage(image)}
              className={`cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transform hover:scale-[1.03] transition-all ${
                selectedImage.src === image.src ? "ring-4 ring-green-500" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-40 object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Thumbnails */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {bottomImages.map((image, index) => (
          <div
            key={`bottom-${index}`}
            onClick={() => setSelectedImage(image)}
            className={`cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all ${
              selectedImage.src === image.src ? "ring-2 ring-green-400" : ""
            }`}
          >
            <img
              src={image.src}
              alt={image.title}
              className="w-full h-36 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagesView;
