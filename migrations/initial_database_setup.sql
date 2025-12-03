-- Migration: Initial Database Setup
-- This script creates the complete database schema and initial data
--
-- All user passwords are set to 'password123' (bcrypt hashed)
-- IMPORTANT: Change all passwords after initial setup!

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `CLUB_MANAGEMENT` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Use the database
USE `CLUB_MANAGEMENT`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Table structure for table `PERSON`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `PERSON` (
  `Person_ID` int(11) NOT NULL AUTO_INCREMENT,
  `First_Name` varchar(50) NOT NULL,
  `Last_Name` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Person_Type` enum('User','Guest') NOT NULL,
  PRIMARY KEY (`Person_ID`),
  UNIQUE KEY `PersonAK1` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `SYSTEM_ROLE`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `SYSTEM_ROLE` (
  `Role_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Role_Name` enum('Admin','Faculty','Student') NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Role_ID`),
  UNIQUE KEY `RoleAK1` (`Role_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `USER`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `USER` (
  `Person_ID` int(11) NOT NULL,
  `Department` varchar(100) DEFAULT NULL,
  `Year` int(11) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Role_ID` int(11) NOT NULL,
  PRIMARY KEY (`Person_ID`),
  KEY `UserFK2` (`Role_ID`),
  CONSTRAINT `UserFK1` FOREIGN KEY (`Person_ID`) REFERENCES `PERSON` (`Person_ID`) ON UPDATE CASCADE,
  CONSTRAINT `UserFK2` FOREIGN KEY (`Role_ID`) REFERENCES `SYSTEM_ROLE` (`Role_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `GUEST`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `GUEST` (
  `Person_ID` int(11) NOT NULL,
  `Organization` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Person_ID`),
  CONSTRAINT `GuestFK1` FOREIGN KEY (`Person_ID`) REFERENCES `PERSON` (`Person_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `CLUB`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `CLUB` (
  `Club_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Club_Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Date_Established` date NOT NULL,
  `Created_By` int(11) NOT NULL,
  `STATUS` enum('Pending','Active','Inactive') NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`Club_ID`),
  UNIQUE KEY `ClubAK1` (`Club_Name`),
  KEY `ClubFK1` (`Created_By`),
  CONSTRAINT `ClubFK1` FOREIGN KEY (`Created_By`) REFERENCES `USER` (`Person_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `CLUB_MEMBERSHIP`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `CLUB_MEMBERSHIP` (
  `Membership_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Person_ID` int(11) NOT NULL,
  `Club_ID` int(11) NOT NULL,
  `Role` enum('Club Leader','Club Member') NOT NULL,
  `Date_Joined` date NOT NULL DEFAULT (CURRENT_DATE),
  `Status` enum('Active','Inactive', 'Pending') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`Membership_ID`),
  UNIQUE KEY `MembershipAK1` (`Person_ID`,`Club_ID`),
  KEY `MembershipFK2` (`Club_ID`),
  CONSTRAINT `MembershipFK1` FOREIGN KEY (`Person_ID`) REFERENCES `USER` (`Person_ID`) ON UPDATE CASCADE,
  CONSTRAINT `MembershipFK2` FOREIGN KEY (`Club_ID`) REFERENCES `CLUB` (`Club_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `BUDGET`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `BUDGET` (
  `Budget_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Club_ID` int(11) NOT NULL,
  `Academic_Year` varchar(9) NOT NULL,
  `Total_Allocated` decimal(10,2) NOT NULL DEFAULT 500.00,
  `Total_Spent` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`Budget_ID`),
  UNIQUE KEY `BudgetAK1` (`Club_ID`,`Academic_Year`),
  CONSTRAINT `BudgetFK1` FOREIGN KEY (`Club_ID`) REFERENCES `CLUB` (`Club_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `EXPENDITURE`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `EXPENDITURE` (
  `Expenditure_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Budget_ID` int(11) NOT NULL,
  `Expense_Description` varchar(500) DEFAULT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Request_Expense_Date` date NOT NULL DEFAULT (CURRENT_DATE),
  `Status` enum('Pending','Approved','Rejected') NOT NULL,
  PRIMARY KEY (`Expenditure_ID`),
  KEY `ExpenditureFK1` (`Budget_ID`),
  CONSTRAINT `ExpenditureFK1` FOREIGN KEY (`Budget_ID`) REFERENCES `BUDGET` (`Budget_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `EVENT`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `EVENT` (
  `Event_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Club_ID` int(11) NOT NULL,
  `Event_Name` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  `Event_Date` date DEFAULT NULL,
  `Venue` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Event_ID`),
  KEY `EventFK1` (`Club_ID`),
  CONSTRAINT `EventFK1` FOREIGN KEY (`Club_ID`) REFERENCES `CLUB` (`Club_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `ATTENDANCE`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ATTENDANCE` (
  `Attendance_ID` int(11) NOT NULL AUTO_INCREMENT,
  `Person_ID` int(11) NOT NULL,
  `Event_ID` int(11) NOT NULL,
  `Check_In_Time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Attendance_ID`),
  UNIQUE KEY `AttendanceAK1` (`Person_ID`,`Event_ID`),
  KEY `AttendanceFK2` (`Event_ID`),
  CONSTRAINT `AttendanceFK1` FOREIGN KEY (`Person_ID`) REFERENCES `PERSON` (`Person_ID`) ON UPDATE CASCADE,
  CONSTRAINT `AttendanceFK2` FOREIGN KEY (`Event_ID`) REFERENCES `EVENT` (`Event_ID`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Insert initial data
-- --------------------------------------------------------

-- Insert SYSTEM_ROLE data
INSERT INTO `SYSTEM_ROLE` (`Role_ID`, `Role_Name`, `Description`) VALUES
(1001, 'Admin', 'System administrator with full access'),
(1002, 'Faculty', 'Faculty member who can advise clubs'),
(1003, 'Student', 'Student who can join and participate in clubs');

-- Insert PERSON data (Users)
INSERT INTO `PERSON` (`Person_ID`, `First_Name`, `Last_Name`, `Email`, `Phone`, `Person_Type`) VALUES
(2001, 'John', 'Doe', 'john.doe@northeastern.edu', '555-0101', 'User'),
(2002, 'Jane', 'Smith', 'jane.smith@northeastern.edu', '555-0102', 'User'),
(2003, 'Michael', 'Johnson', 'michael.j@northeastern.edu', '555-0103', 'User'),
(2004, 'Emily', 'Brown', 'emily.brown@northeastern.edu', '555-0104', 'User'),
(2005, 'David', 'Wilson', 'david.wilson@northeastern.edu', '555-0105', 'User'),
(2006, 'Sarah', 'Davis', 'sarah.davis@northeastern.edu', '555-0106', 'User'),
(2007, 'Robert', 'Martinez', 'robert.m@northeastern.edu', '555-0107', 'User'),
(2008, 'Lisa', 'Anderson', 'lisa.anderson@northeastern.edu', '555-0108', 'User'),
(2009, 'James', 'Taylor', 'james.taylor@northeastern.edu', '555-0109', 'User'),
(2010, 'Mary', 'Thomas', 'mary.thomas@northeastern.edu', '555-0110', 'User'),
(2011, 'Chris', 'Moore', 'chris.moore@northeastern.edu', '555-0111', 'User'),
(2012, 'Amanda', 'White', 'amanda.white@northeastern.edu', '555-0112', 'User'),
(2013, 'Kevin', 'Harris', 'kevin.harris@northeastern.edu', '555-0113', 'User'),
(2014, 'Rachel', 'Clark', 'rachel.clark@northeastern.edu', '555-0114', 'User'),
(2015, 'Tom', 'Lewis', 'tom.lewis@northeastern.edu', '555-0115', 'User'),
(2101, 'Guest', 'Speaker', 'guest.speaker@external.com', '555-0201', 'Guest'),
(2102, 'Alumni', 'Member', 'alumni.member@external.com', '555-0202', 'Guest'),
(2103, 'Industry', 'Partner', 'industry.partner@company.com', '555-0203', 'Guest'),
(2104, 'Visiting', 'Professor', 'visiting.prof@otherschool.edu', '555-0204', 'Guest'),
(2105, 'Community', 'Leader', 'community.leader@local.org', '555-0205', 'Guest');

-- Insert USER data with bcryptjs hashed passwords - ASK ANTON FOR THE DEFAULT VALUE!
-- Password hash: $2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC
INSERT INTO `USER` (`Person_ID`, `Department`, `Year`, `Password`, `Role_ID`) VALUES
(2001, 'Computer Science', 3, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1001),
(2002, 'Computer Science', 4, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2003, 'Engineering', 2, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2004, 'Business', 3, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2005, 'Computer Science', NULL, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1002),
(2006, 'Mathematics', 1, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2007, 'Engineering', 4, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2008, 'Business', 2, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2009, 'Arts', NULL, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1002),
(2010, 'Computer Science', 3, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2011, 'Mathematics', 2, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2012, 'Engineering', 3, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2013, 'Business', 4, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2014, 'Arts', 1, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1003),
(2015, 'Physics', NULL, '$2a$10$Kp9J85h52vUQiZUvPVwL6ex//d5iIFSs9zijnTzXBNPnUmEJlnlaC', 1002);

-- Insert GUEST data
INSERT INTO `GUEST` (`Person_ID`, `Organization`) VALUES
(2101, 'Tech Innovations Inc'),
(2102, 'University Alumni Association'),
(2103, 'Microsoft Corporation'),
(2104, 'Harvard University'),
(2105, 'Local Community Center');

-- Insert CLUB data
INSERT INTO `CLUB` (`Club_ID`, `Club_Name`, `Description`, `Date_Established`, `Created_By`, `STATUS`) VALUES
(3001, 'Chess Club', 'Strategic board game enthusiasts', '2020-09-01', 2001, 'Active'),
(3002, 'Robotics Club', 'Build and program robots', '2019-08-15', 2002, 'Active'),
(3003, 'Drama Society', 'Theater and performance arts', '2018-09-10', 2003, 'Active'),
(3004, 'Photography Club', 'Capture moments and learn photography', '2021-01-20', 2004, 'Active'),
(3005, 'Debate Team', 'Competitive debate and public speaking', '2019-10-05', 2005, 'Active'),
(3006, 'Math Club', 'Mathematics competitions and problem solving', '2020-02-14', 2006, 'Active'),
(3007, 'Environmental Club', 'Sustainability and environmental awareness', '2021-03-22', 2007, 'Active'),
(3008, 'Music Society', 'Musicians and music appreciation', '2018-11-30', 2008, 'Active'),
(3009, 'Entrepreneurship Club', 'Business ideas and startup culture', '2020-06-10', 2009, 'Active'),
(3010, 'Coding Club', 'Programming competitions and workshops', '2019-09-01', 2010, 'Active');

-- Insert CLUB_MEMBERSHIP data
INSERT INTO `CLUB_MEMBERSHIP` (`Membership_ID`, `Person_ID`, `Club_ID`, `Role`, `Date_Joined`, `Status`) VALUES
(1, 2001, 3001, 'Club Leader', '2025-11-09', 'Active'),
(2, 2002, 3002, 'Club Leader', '2025-11-09', 'Active'),
(3, 2003, 3003, 'Club Leader', '2025-11-09', 'Active'),
(4, 2004, 3004, 'Club Leader', '2025-11-09', 'Active'),
(5, 2005, 3005, 'Club Leader', '2025-11-09', 'Active'),
(6, 2006, 3006, 'Club Leader', '2025-11-09', 'Active'),
(7, 2007, 3007, 'Club Leader', '2025-11-09', 'Active'),
(8, 2008, 3008, 'Club Leader', '2025-11-09', 'Active'),
(9, 2009, 3009, 'Club Leader', '2025-11-09', 'Active'),
(10, 2010, 3010, 'Club Leader', '2025-11-09', 'Active'),
(4002, 2002, 3001, 'Club Member', '2020-09-15', 'Active'),
(4003, 2003, 3001, 'Club Member', '2020-10-01', 'Active'),
(4004, 2011, 3001, 'Club Member', '2021-01-10', 'Active'),
(4005, 2004, 3002, 'Club Member', '2019-09-01', 'Active'),
(4006, 2006, 3002, 'Club Member', '2020-01-10', 'Active'),
(4007, 2010, 3002, 'Club Member', '2020-02-15', 'Active'),
(4008, 2007, 3003, 'Club Member', '2019-01-15', 'Active'),
(4009, 2014, 3003, 'Club Member', '2020-09-01', 'Active'),
(4010, 2008, 3004, 'Club Member', '2021-02-01', 'Active'),
(4011, 2012, 3004, 'Club Member', '2021-03-10', 'Active'),
(4012, 2009, 3005, 'Club Member', '2020-01-10', 'Active'),
(4013, 2013, 3005, 'Club Member', '2020-02-20', 'Active'),
(4014, 2010, 3006, 'Club Member', '2020-03-01', 'Active'),
(4015, 2011, 3006, 'Club Member', '2020-04-15', 'Active'),
(4016, 2012, 3007, 'Club Member', '2021-04-01', 'Active'),
(4017, 2013, 3008, 'Club Member', '2019-01-20', 'Active'),
(4018, 2014, 3009, 'Club Member', '2020-07-01', 'Active'),
(4019, 2001, 3010, 'Club Member', '2019-09-15', 'Active'),
(4020, 2015, 3010, 'Club Member', '2020-01-10', 'Active');

-- Insert BUDGET data
INSERT INTO `BUDGET` (`Budget_ID`, `Club_ID`, `Academic_Year`, `Total_Allocated`, `Total_Spent`) VALUES
(5001, 3001, '2024-2025', 500.00, 150.00),
(5002, 3002, '2024-2025', 500.00, 330.00),
(5003, 3003, '2024-2025', 500.00, 350.00),
(5004, 3004, '2024-2025', 500.00, 300.00),
(5005, 3005, '2024-2025', 500.00, 450.00),
(5006, 3006, '2024-2025', 500.00, 300.00),
(5007, 3007, '2024-2025', 500.00, 350.00),
(5008, 3008, '2024-2025', 500.00, 200.00),
(5009, 3009, '2024-2025', 500.00, 300.00),
(5010, 3010, '2024-2025', 500.00, 330.00);

-- Insert EXPENDITURE data
INSERT INTO `EXPENDITURE` (`Expenditure_ID`, `Budget_ID`, `Expense_Description`, `Amount`, `Request_Expense_Date`, `Status`) VALUES
(6001, 5001, 'Chess boards and pieces', 100.00, '2024-09-15', 'Approved'),
(6002, 5001, 'Chess clock', 50.00, '2024-10-01', 'Approved'),
(6003, 5001, 'Tournament fees', 80.00, '2024-10-15', 'Pending'),
(6004, 5002, 'Arduino starter kit', 180.00, '2024-09-01', 'Approved'),
(6005, 5002, 'Sensors and components', 150.00, '2024-10-15', 'Approved'),
(6006, 5002, 'Extra components', 100.00, '2024-11-01', 'Pending'),
(6007, 5003, 'Stage props', 200.00, '2024-09-10', 'Approved'),
(6008, 5003, 'Costume materials', 150.00, '2024-10-20', 'Approved'),
(6009, 5003, 'Lighting rental', 200.00, '2024-10-25', 'Rejected'),
(6010, 5004, 'Camera accessories', 180.00, '2024-09-01', 'Approved'),
(6011, 5004, 'Photo printing paper', 120.00, '2024-10-15', 'Approved'),
(6012, 5005, 'Research materials', 100.00, '2024-09-20', 'Approved'),
(6013, 5005, 'Debate resources subscription', 150.00, '2024-10-01', 'Approved'),
(6014, 5005, 'Tournament fees', 200.00, '2024-11-15', 'Approved'),
(6015, 5006, 'Competition registration', 180.00, '2024-09-15', 'Approved'),
(6016, 5006, 'Math workbooks', 120.00, '2024-10-01', 'Approved'),
(6017, 5007, 'Recycling supplies', 150.00, '2024-09-01', 'Approved'),
(6018, 5007, 'Tree saplings', 200.00, '2024-10-20', 'Approved'),
(6019, 5008, 'Sheet music', 80.00, '2024-09-01', 'Approved'),
(6020, 5008, 'Instrument maintenance', 120.00, '2024-10-15', 'Approved'),
(6021, 5009, 'Event venue rental', 200.00, '2024-09-01', 'Approved'),
(6022, 5009, 'Marketing materials', 100.00, '2024-10-10', 'Approved'),
(6023, 5010, 'Online course subscriptions', 180.00, '2024-09-01', 'Approved'),
(6024, 5010, 'Competition fees', 150.00, '2024-10-20', 'Approved');

-- Insert EVENT data
INSERT INTO `EVENT` (`Event_ID`, `Club_ID`, `Event_Name`, `Description`, `Event_Date`, `Venue`) VALUES
(7001, 3001, 'Fall Chess Tournament', 'Annual chess competition', '2024-11-15', 'Student Center Room 101'),
(7002, 3001, 'Chess Workshop for Beginners', 'Learn chess basics', '2024-10-20', 'Library Meeting Room'),
(7003, 3002, 'Robotics Showcase', 'Display of student robot projects', '2024-12-01', 'Engineering Hall'),
(7004, 3002, 'Arduino Workshop', 'Introduction to Arduino programming', '2024-10-10', 'Lab Building Room 205'),
(7005, 3003, 'Fall Play Performance', 'Shakespearean drama production', '2024-11-20', 'University Theater'),
(7006, 3004, 'Campus Photo Walk', 'Guided photography tour', '2024-10-25', 'Campus Grounds'),
(7007, 3005, 'Regional Debate Competition', 'Intercollegiate debate', '2024-11-10', 'Auditorium'),
(7008, 3006, 'Math Olympiad Prep Session', 'Competition preparation', '2024-10-30', 'Mathematics Building'),
(7009, 3007, 'Campus Cleanup Day', 'Environmental service event', '2024-10-15', 'Main Campus'),
(7010, 3008, 'Fall Concert', 'Student musical performances', '2024-11-25', 'Concert Hall'),
(7011, 3009, 'Startup Pitch Night', 'Student business idea presentations', '2024-11-05', 'Business School'),
(7012, 3010, 'Hackathon 2024', '24-hour coding competition', '2024-12-05', 'Computer Science Building');

-- Insert ATTENDANCE data
INSERT INTO `ATTENDANCE` (`Attendance_ID`, `Person_ID`, `Event_ID`, `Check_In_Time`) VALUES
(8001, 2001, 7001, '2024-11-15 09:00:00'),
(8002, 2002, 7001, '2024-11-15 09:05:00'),
(8003, 2003, 7001, '2024-11-15 09:10:00'),
(8004, 2006, 7001, '2024-11-15 09:15:00'),
(8005, 2101, 7001, '2024-11-15 09:20:00'),
(8006, 2002, 7002, '2024-10-20 14:00:00'),
(8007, 2006, 7002, '2024-10-20 14:05:00'),
(8008, 2010, 7002, '2024-10-20 14:10:00'),
(8009, 2011, 7002, '2024-10-20 14:15:00'),
(8010, 2002, 7003, '2024-12-01 10:00:00'),
(8011, 2004, 7003, '2024-12-01 10:05:00'),
(8012, 2006, 7003, '2024-12-01 10:10:00'),
(8013, 2102, 7003, '2024-12-01 10:15:00'),
(8014, 2002, 7004, '2024-10-10 15:00:00'),
(8015, 2010, 7004, '2024-10-10 15:05:00'),
(8016, 2003, 7005, '2024-11-20 19:00:00'),
(8017, 2007, 7005, '2024-11-20 19:05:00'),
(8018, 2001, 7005, '2024-11-20 19:10:00'),
(8019, 2103, 7005, '2024-11-20 19:15:00'),
(8020, 2004, 7006, '2024-10-25 10:00:00'),
(8021, 2008, 7006, '2024-10-25 10:05:00'),
(8022, 2012, 7006, '2024-10-25 10:10:00'),
(8023, 2005, 7007, '2024-11-10 13:00:00'),
(8024, 2009, 7007, '2024-11-10 13:05:00'),
(8025, 2104, 7007, '2024-11-10 13:10:00'),
(8026, 2006, 7008, '2024-10-30 14:00:00'),
(8027, 2010, 7008, '2024-10-30 14:05:00'),
(8028, 2011, 7008, '2024-10-30 14:10:00'),
(8029, 2007, 7009, '2024-10-15 08:00:00'),
(8030, 2105, 7009, '2024-10-15 08:05:00'),
(8031, 2008, 7010, '2024-11-25 18:00:00'),
(8032, 2013, 7010, '2024-11-25 18:05:00'),
(8033, 2009, 7011, '2024-11-05 17:00:00'),
(8034, 2014, 7011, '2024-11-05 17:05:00'),
(8035, 2010, 7012, '2024-12-05 09:00:00'),
(8036, 2001, 7012, '2024-12-05 09:05:00'),
(8037, 2002, 7012, '2024-12-05 09:10:00'),
(8038, 2015, 7012, '2024-12-05 09:15:00');

-- --------------------------------------------------------
-- Create Views
-- --------------------------------------------------------

-- View: Active Club Members
CREATE OR REPLACE VIEW `Active_Club_Members` AS
SELECT
    cm.Membership_ID,
    p.Person_ID,
    p.First_Name,
    p.Last_Name,
    p.Email,
    c.Club_ID,
    c.Club_Name,
    cm.Role,
    cm.Date_Joined
FROM CLUB_MEMBERSHIP cm
JOIN USER u ON cm.Person_ID = u.Person_ID
JOIN PERSON p ON u.Person_ID = p.Person_ID
JOIN CLUB c ON cm.Club_ID = c.Club_ID
WHERE cm.Status = 'Active' AND c.STATUS = 'Active';

-- --------------------------------------------------------
-- Create Stored Procedures
-- --------------------------------------------------------

-- Stored Procedure: Get Club Budget Summary
DELIMITER //
CREATE PROCEDURE `Get_Club_Budget_Summary`(
    IN p_Club_ID INT
)
BEGIN
    SELECT
        c.Club_ID,
        c.Club_Name,
        b.Academic_Year,
        b.Total_Allocated,
        b.Total_Spent,
        (b.Total_Allocated - b.Total_Spent) AS Remaining_Budget
    FROM CLUB c
    INNER JOIN BUDGET b ON c.Club_ID = b.Club_ID
    WHERE c.Club_ID = p_Club_ID;
END//
DELIMITER ;

-- Stored Procedure: Update Budget Spent
DELIMITER //
CREATE PROCEDURE `Update_Budget_Spent`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_Budget_ID INT;
    DECLARE v_Total_Approved DECIMAL(10,2);
    
    -- Cursor to iterate through all budgets
    DECLARE budget_cursor CURSOR FOR
        SELECT
            b.Budget_ID,
            COALESCE(SUM(e.Amount), 0) AS Total_Approved
        FROM BUDGET b
        LEFT JOIN EXPENDITURE e ON b.Budget_ID = e.Budget_ID AND e.Status = 'Approved'
        GROUP BY b.Budget_ID;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN budget_cursor;
    
    -- Loop through each budget
    read_loop: LOOP
        FETCH budget_cursor INTO v_Budget_ID, v_Total_Approved;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Update the budget's Total_Spent with sum of approved expenditures
        UPDATE BUDGET
        SET Total_Spent = v_Total_Approved
        WHERE Budget_ID = v_Budget_ID;
    END LOOP;
    
    CLOSE budget_cursor;
    
    SELECT 'Budget totals updated successfully' AS Message;
END//
DELIMITER ;

-- --------------------------------------------------------
-- Create Triggers
-- --------------------------------------------------------

-- Trigger: Create Club Leader membership when club status changes from Pending to Active
DELIMITER $$
CREATE TRIGGER `Club_Approve_Create_Leader` 
AFTER UPDATE ON `CLUB` 
FOR EACH ROW 
BEGIN
    -- Only trigger when status changes from Pending to Active
    IF OLD.STATUS = 'Pending' AND NEW.STATUS = 'Active' THEN
        -- Create club leader membership
        INSERT INTO CLUB_MEMBERSHIP (Person_ID, Club_ID, Role, Date_Joined, Status)
        VALUES (NEW.Created_By, NEW.Club_ID, 'Club Leader', CURRENT_DATE, 'Active');
    END IF;
END$$
DELIMITER ;

-- Trigger: Create Budget on Club Creation
DELIMITER $$

CREATE TRIGGER `Create_Budget_On_Club_Creation` 
AFTER INSERT ON `CLUB` 
FOR EACH ROW 
BEGIN
    DECLARE current_academic_year VARCHAR(9);
    
    -- Calculate current academic year (e.g., "2024-2025")
    -- Academic year typically runs from Fall (September) to Spring (May)
    -- If current month is Jan-Aug, use previous year as start year
    -- If current month is Sep-Dec, use current year as start year
    SET current_academic_year = CONCAT(
        IF(MONTH(CURRENT_DATE) >= 9, YEAR(CURRENT_DATE), YEAR(CURRENT_DATE) - 1),
        '-',
        IF(MONTH(CURRENT_DATE) >= 9, YEAR(CURRENT_DATE) + 1, YEAR(CURRENT_DATE))
    );
    
    -- Insert a new budget record for the newly created club
    INSERT INTO BUDGET (Club_ID, Academic_Year, Total_Allocated, Total_Spent)
    VALUES (NEW.Club_ID, current_academic_year, 500.00, 0.00);
END$$

DELIMITER ;



-- --------------------------------------------------------
-- Set AUTO_INCREMENT values
-- --------------------------------------------------------

ALTER TABLE `ATTENDANCE` AUTO_INCREMENT = 8039;
ALTER TABLE `BUDGET` AUTO_INCREMENT = 5011;
ALTER TABLE `CLUB` AUTO_INCREMENT = 3011;
ALTER TABLE `CLUB_MEMBERSHIP` AUTO_INCREMENT = 4021;
ALTER TABLE `EVENT` AUTO_INCREMENT = 7013;
ALTER TABLE `EXPENDITURE` AUTO_INCREMENT = 6025;
ALTER TABLE `PERSON` AUTO_INCREMENT = 2106;
ALTER TABLE `SYSTEM_ROLE` AUTO_INCREMENT = 1004;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------
-- IMPORTANT: Run the following migrations after initial setup:
-- --------------------------------------------------------
--
-- --------------------------------------------------------

