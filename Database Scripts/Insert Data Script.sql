# INSERT LIMIT
/* INSERT INTO booking_limit (session_date, station_id, role_id, booking_limit) VALUES 
(current_date(), 2, 3, 2), (current_date(), 5, 7, 2), (current_date(), 5, 8, 2);

INSERT INTO booking_limit (session_date, station_id, role_id, booking_limit) VALUES 
('2018-07-03', 3, 4, 1); */

# INSERT STATIONS & STATION_ROLES
INSERT INTO stations (station_name, description, station_start, station_end, is_active, imagepath)
VALUES ('Aviation', 'Flyyy!', '10:00', '18:00', 1, 'pic_plane.png'),
('KFC', 'Good!', '10:00', '18:00', 1, 'pic_kfc.png');

INSERT INTO station_roles (station_id, role_name, durationInMins, capacity, noOfReservedSlots, imagepath) 
VALUES (1, 'Pilot', 30, 4, 2, 'pilot.png'), (1, 'Cabin Crew', 30, 4, 2, 'crew.png'),
(2, 'Chef', 20, 4, 2, 'chef.png');

# GENERATE SESSIONS & AVAILABLE_SESSIONS DETAILS BY RUNNING NODE.JS SERVER

# AVAILABLE_SESSIONS DATA WILL BE GENERATED DAILY

# INSERT - BOOKING_DETAILS
INSERT INTO booking_details (session_date, session_id, station_id, role_id, rfid, queue_no, booking_status) VALUES 
(current_date(), 1, 1, 1, 'e0001', 'A0001', 'Confirmed'), (current_date(), 1, 1, 1, 'e0002', 'A0002', 'Confirmed'),
(current_date(), 1, 1, 1, 'e0003', 'A0003', 'Confirmed'), (current_date(), 1, 1, 1, 'e0004', 'A0004', 'Confirmed'),
(current_date(), 1, 1, 1, 'e0005', 'A0005', 'Confirmed');

INSERT INTO account_type (account_type) VALUES ('Admin');
INSERT INTO account_type (account_type) VALUES ('Crew');

# Password: 123123
INSERT INTO user_accounts (account_type_id, username, password_hash)
VALUES (1, 'jj', '$2a$10$pyMYtPfIvE.PAboF3cIx9.IsyW73voMIRxFINohzgeV0I2BxwnrEu');

SELECT * FROM user_accounts;