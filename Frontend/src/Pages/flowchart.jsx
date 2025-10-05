import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Zoom,
  Fade,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccountCircle,
  Security,
  ShoppingCart,
  Analytics,
  Payment,
  Storage,
  Agriculture,
  Warning,
  Timeline,
  Chat,
  Cloud,
  BugReport
} from '@mui/icons-material';

const AgriConnectFlowchart = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    {
      id: 'auth',
      title: 'Authentication System',
      icon: <Security sx={{ fontSize: 32 }} />,
      color: '#ff6b6b',
      description: 'User registration, login, JWT tokens, and role-based access control',
      features: ['User Registration', 'JWT Authentication', 'Password Reset', 'Google OAuth', 'Address Management'],
      connections: ['user', 'database']
    },
    {
      id: 'market',
      title: 'Agrimarket Platform',
      icon: <ShoppingCart sx={{ fontSize: 32 }} />,
      color: '#ff9ff3',
      description: 'Complete marketplace for agricultural products and crop trading',
      features: ['Product Management', 'Real-time Auctions', 'Shopping Cart', 'Order Processing', 'Inventory System'],
      connections: ['payment', 'database', 'analytics']
    },
    {
      id: 'analytics',
      title: 'Agri Analytics',
      icon: <Analytics sx={{ fontSize: 32 }} />,
      color: '#5f27cd',
      description: 'Advanced analytics and prediction systems for farm management',
      features: ['Crop Disease Detection', 'Yield Prediction', 'Farm Statistics', 'Market Analysis', 'What-If Simulations'],
      connections: ['database', 'weather', 'disease-prediction']
    },
    {
      id: 'payment',
      title: 'Payment System',
      icon: <Payment sx={{ fontSize: 32 }} />,
      color: '#54a0ff',
      description: 'Secure payment processing and transaction management',
      features: ['Payment Processing', 'Webhook Handling', 'Transaction Records', 'Multi-provider Support'],
      connections: ['market', 'database']
    },
    {
      id: 'database',
      title: 'MongoDB Database',
      icon: <Storage sx={{ fontSize: 32 }} />,
      color: '#8395a7',
      description: 'Central data storage with multiple schemas and collections',
      features: ['User Data', 'Product Catalog', 'Transaction Records', 'Analytics Data', 'Farm Information'],
      connections: ['all']
    },
    {
      id: 'disease-detection',
      title: 'CNN Disease Detection',
      icon: <BugReport sx={{ fontSize: 32 }} />,
      color: '#e74c3c',
      description: 'Convolutional Neural Network for real-time crop disease identification',
      features: ['Image Upload', 'Real-time Analysis', 'Disease Classification', 'Confidence Scoring', 'Treatment Suggestions'],
      connections: ['analytics', 'reports']
    },
    {
      id: 'disease-prediction',
      title: 'LSTM Disease Prediction',
      icon: <Timeline sx={{ fontSize: 32 }} />,
      color: '#9b59b6',
      description: 'Long Short-Term Memory networks for outbreak forecasting',
      features: ['Temporal Analysis', 'Risk Assessment', 'Early Warnings', 'Spatial Propagation'],
      connections: ['analytics', 'weather']
    },
    {
      id: 'yield-prediction',
      title: 'LSTM Yield Prediction',
      icon: <Agriculture sx={{ fontSize: 32 }} />,
      color: '#27ae60',
      description: 'Yield forecasting using historical data and environmental factors',
      features: ['Multi-factor Analysis', 'Seasonal Trends', 'Market Impact', 'Optimization Suggestions'],
      connections: ['analytics', 'weather']
    },
    {
      id: 'weed-detection',
      title: 'YOLOv8 Weed Detection',
      icon: <Warning sx={{ fontSize: 32 }} />,
      color: '#f39c12',
      description: 'Real-time weed identification for cotton crops',
      features: ['Live Monitoring', 'Image/Video Upload', 'Cotton-specific Detection', 'Treatment Guidance'],
      connections: ['analytics']
    },
    {
      id: 'weather',
      title: 'Weather Insights',
      icon: <Cloud sx={{ fontSize: 32 }} />,
      color: '#3498db',
      description: 'Real-time weather data with TTS and farmer-friendly interface',
      features: ['Live Forecasts', 'TTS Alerts', 'Crop-specific Advisories', 'Historical Analysis'],
      connections: ['analytics', 'dashboard']
    },
    {
      id: 'ai-assistant',
      title: 'AI Chat Assistant',
      icon: <Chat sx={{ fontSize: 32 }} />,
      color: '#1abc9c',
      description: 'Langchain & Pinecone powered AI for agricultural queries',
      features: ['Natural Language Processing', 'Context Awareness', 'Multi-format Responses', 'Learning Capabilities'],
      connections: ['all']
    }
  ];

  const userRoles = [
    { role: 'Farmer', color: '#2ecc71', permissions: ['Create Products', 'Manage Crops', 'View Analytics'] },
    { role: 'Trader', color: '#e67e22', permissions: ['Buy Products', 'List Items', 'Participate in Auctions'] },
    { role: 'Buyer', color: '#3498db', permissions: ['Purchase Products', 'View Listings', 'Track Orders'] },
    { role: 'Admin', color: '#e74c3c', permissions: ['System Management', 'User Management', 'Analytics Access'] }
  ];

  const ModuleCard = ({ module }) => (
    <Zoom in={true} style={{ transitionDelay: activeModule === module.id ? '0ms' : '200ms' }}>
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          border: activeModule === module.id ? `3px solid ${module.color}` : '2px solid #e0e0e0',
          transform: activeModule === module.id ? 'scale(1.05)' : 'scale(1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box
            sx={{
              backgroundColor: module.color,
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'white'
            }}
          >
            {module.icon}
          </Box>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: module.color }}>
            {module.title}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
            {module.description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
            {module.features.slice(0, 3).map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {module.features.length > 3 && (
              <Chip
                label={`+${module.features.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  return (
    <Container className="mt-16" maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          AgriConnect+ System Architecture
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Comprehensive Agricultural Intelligence Platform with Multi-Modal AI Integration
        </Typography>
      </Box>

      {/* User Roles Section */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5e8 100%)' }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircle color="primary" />
          User Roles & Permissions
        </Typography>
        <Grid container spacing={2}>
          {userRoles.map((role, index) => (
            <Grid item xs={12} sm={6} md={3} key={role.role}>
              <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card sx={{ borderLeft: `4px solid ${role.color}` }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: role.color }}>
                      {role.role}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {role.permissions.map((permission, idx) => (
                        <Chip
                          key={idx}
                          label={permission}
                          size="small"
                          sx={{ m: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Main Modules Grid */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Storage color="primary" />
          System Modules & Components
        </Typography>

        <Grid container spacing={3}>
          {modules.map((module, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
              <ModuleCard module={module} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Active Module Details */}
      {activeModule && (
        <Fade in={true}>
          <Paper sx={{ p: 3, mt: 4, border: `2px solid ${modules.find(m => m.id === activeModule)?.color}` }}>
            <Typography variant="h5" gutterBottom sx={{ color: modules.find(m => m.id === activeModule)?.color }}>
              {modules.find(m => m.id === activeModule)?.title} - Detailed View
            </Typography>
            <Typography variant="body1" paragraph>
              {modules.find(m => m.id === activeModule)?.description}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Key Features</Typography>
                <ul>
                  {modules.find(m => m.id === activeModule)?.features.map((feature, index) => (
                    <li key={index}>
                      <Typography variant="body2">{feature}</Typography>
                    </li>
                  ))}
                </ul>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>System Connections</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {modules.find(m => m.id === activeModule)?.connections.map((connection, index) => (
                    <Chip
                      key={index}
                      label={connection === 'all' ? 'All Systems' : connection}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* System Overview */}
      <Paper sx={{ p: 3, mt: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
        <Typography variant="h5" gutterBottom>
          System Architecture Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              🎯 Core Technologies
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'TensorFlow', 'Python', 'Material-UI', 'JWT Auth'].map((tech) => (
                <Chip key={tech} label={tech} variant="filled" color="primary" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="secondary">
              🤖 AI/ML Integration
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['CNN Models', 'LSTM Networks', 'YOLOv8', 'Langchain', 'Pinecone', 'Computer Vision', 'NLP'].map((ai) => (
                <Chip key={ai} label={ai} variant="filled" color="secondary" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AgriConnectFlowchart;