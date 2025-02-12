import React, { 
  useState, 
  useMemo, 
  useCallback 
} from "react";
import { 
  FaProjectDiagram, 
  FaChartBar, 
  FaBell,
  FaClipboardList 
} from 'react-icons/fa';

import Card from "../Componenets/Card";
import CircleChart from "../Componenets/CircleChart";
import RecentActivity from "../Componenets/RecentActivity";
import BarChart from "../Componenets/BarChart";
import '../assets/css/Dashboard.css';

// Utility function for date formatting
const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const diffInDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    projects: {
      heading: 'Projects',
      subheading: 'Active Project Management',
      icon: FaProjectDiagram,
      color: 'rgba(59, 130, 246, 0.1)',
      projects: [
        { 
          projectName: 'Project X', 
          status: 'Due in 3 days', 
          priority: 'high',
          progress: 65,
          team: 4
        },
        { 
          projectName: 'Project Y', 
          status: 'Due in 5 days', 
          priority: 'medium',
          progress: 40,
          team: 3
        },
        { 
          projectName: 'Project Z', 
          status: 'Due in 8 days', 
          priority: 'low',
          progress: 20,
          team: 2
        },
      ],
    },
    analysis: {
      heading: 'Analysis',
      subheading: 'Comprehensive Data Insights',
      icon: FaChartBar,
      color: 'rgba(16, 185, 129, 0.1)',
      projects: [
        { 
          projectName: 'Market Research', 
          status: 'In Progress', 
          complexity: 'High',
          completionRate: 75,
          dataPoints: 120
        },
        { 
          projectName: 'Financial Model', 
          status: 'Pending', 
          complexity: 'Medium',
          completionRate: 45,
          dataPoints: 80
        },
        { 
          projectName: 'Risk Assessment', 
          status: 'Initiated', 
          complexity: 'Low',
          completionRate: 25,
          dataPoints: 50
        },
      ],
    },
    alerts: {
      heading: 'Alerts',
      subheading: 'Critical Notifications',
      icon: FaBell,
      color: 'rgba(245, 158, 11, 0.1)',
      projects: [
        { 
          projectName: 'Security Update', 
          status: 'High Priority', 
          type: 'Security',
          timestamp: new Date(),
          actionRequired: true
        },
        { 
          projectName: 'Performance Anomaly', 
          status: 'Medium Priority', 
          type: 'Performance',
          timestamp: new Date(Date.now() - 86400000),
          actionRequired: false
        },
        { 
          projectName: 'Compliance Check', 
          status: 'Low Priority', 
          type: 'Compliance',
          timestamp: new Date(Date.now() - 172800000),
          actionRequired: true
        },
      ],
    }
  });

  const [activeSection, setActiveSection] = useState('projects');

  const recentActivities = useMemo(() => ({
    recentActDes: [
      { 
        head: 'Project X', 
        des: 'Updated 2 hours ago', 
        timestamp: new Date('2024-02-10T14:30:00'),
        icon: FaProjectDiagram
      },
      { 
        head: 'Project Y', 
        des: 'Completed 5 days ago', 
        timestamp: new Date('2024-02-05T09:15:00'),
        icon: FaChartBar
      },
      { 
        head: 'Project Z', 
        des: 'Updated 10 days ago', 
        timestamp: new Date('2024-01-31T11:45:00'),
        icon: FaClipboardList
      }
    ]
  }), []);

  const costData = useMemo(() => ({
    Circle1: { 
      name: 'Operating Costs', 
      value: 2900, 
      color: '#3b82f6', 
      percentage: 25,
      trend: 'up'
    },
    Circle2: { 
      name: 'Marketing Expenses', 
      value: 1521.13, 
      color: '#10b981', 
      percentage: 50,
      trend: 'stable'
    },
    Circle3: { 
      name: 'R&D Investment', 
      value: 1321.31, 
      color: '#f59e0b', 
      percentage: 75,
      trend: 'down'
    },
  }), []);

  const aspectsData = useMemo(() => [
    { name: 'Revenue', height: 40, color: '#3b82f6' },
    { name: 'Expenses', height: 100, color: '#10b981' },
    { name: 'Profit', height: 80, color: '#f59e0b' },
    { name: 'Investment', height: 120, color: '#6366f1' },
    { name: 'Growth', height: 50, color: '#8b5cf6' },
    { name: 'Innovation', height: 90, color: '#ec4899' },
  ], []);

  const renderCardData = useCallback((data) => {
    const Icon = data.icon;
    return (
      <div 
        className="col-12 col-md-12 col-lg-6 col-xl-4 col-xxl-4"
      >
        <div 
          className={`professional-card ${activeSection === data.heading.toLowerCase() ? 'active' : ''}`}
          onClick={() => setActiveSection(data.heading.toLowerCase())}
        >
          <div className="card-header">
            <Icon className="card-icon" />
            <h3>{data.heading}</h3>
          </div>
          <div className="card-content">
            <p>{data.subheading}</p>
            {data.projects.map((project, index) => (
              <div key={index} className="project-item">
                <span>{project.projectName}</span>
                <span className={`status ${project.priority || project.complexity}`}>
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [activeSection]);

  return (
    <div 
      className="dashboard-container"
    >
      <section className="section1 sec1-cards">
        <div className="container-fluid px-5">
          <div className="row no-gutters justify-content-center">
            {renderCardData(dashboardData.projects)}
            {renderCardData(dashboardData.analysis)}
            {renderCardData(dashboardData.alerts)}
          </div>
        </div>
      </section>

      <section className="Dashsection2">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-12 col-xl-8">
              <div>
                <BarChart props={aspectsData} />
              </div>
              <div>
                <div className="recent-activites">
                  <RecentActivity recentAct={recentActivities} />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-12 col-xl-4">
              <div>
                <CircleChart data={costData} />
              </div>
              <div>
                <div className="Compare">
                  <div className="ConvMarmain">
                    <div className="ConvMar-heading">
                      <h3>Contractor Estimate vs Market Value</h3>
                    </div>
                    <div className="dotConvMar">
                      <div className="conEs">
                        <span className="dot dot-1"></span> Contractor Estimates
                      </div>
                      <div className="marVal">
                        <span className="dot dot-2"></span> Market Value
                      </div>
                    </div>
                    <div className="ConvMarImg">
                      <img src="/img/Chart-image.png" alt="Estimate Comparison Chart" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
