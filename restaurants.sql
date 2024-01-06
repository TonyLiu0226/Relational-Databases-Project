drop table Follows;
drop table Verified_User;
drop table offers;
drop table Restaurant_Review;
drop table Menu_Item_Review;
drop table Helpful_Tag;
drop table Review;
drop table Menu_Item;
drop table Menu_Item_Type;
drop table Restaurant;
drop table Postal_Area;
drop table Address;
drop table Owner;
drop table Review_User;
drop table City;


-- CREATE TABLES
CREATE TABLE City(
  Name VARCHAR(30),
  Province_State VARCHAR(30),
  Country VARCHAR(30),
  PRIMARY KEY(Name, Province_State)
  );
 
CREATE TABLE Review_User(
  UserId VARCHAR(30) PRIMARY KEY,
  Name VARCHAR(30),
  CityName VARCHAR(30) NOT NULL,
  Province_State VARCHAR(30) NOT NULL,
  FOREIGN KEY (CityName, Province_State) REFERENCES City
  );

CREATE TABLE Follows(
  UserId1 VARCHAR(30) NOT NULL,
  UserId2 VARCHAR(30) NOT NULL,
  PRIMARY KEY(UserId1,UserId2),
  FOREIGN KEY (UserId1) REFERENCES Review_User ON DELETE CASCADE,
  FOREIGN KEY (UserId2) REFERENCES Review_User ON DELETE CASCADE
 );
 
CREATE TABLE Verified_User(
  UserId VARCHAR(30) NOT NULL,
  VerificationNumber INT UNIQUE,
  FOREIGN KEY (UserId) REFERENCES Review_User ON DELETE CASCADE
 );
 
CREATE TABLE Owner(
  SIN INT PRIMARY KEY,
  Name VARCHAR(30)
 );
 
CREATE TABLE Postal_Area(
  PostalCode VARCHAR(7) PRIMARY KEY,
  Province_State VARCHAR(30)
  );
 
CREATE TABLE Address(
  HouseNumber INT,
  StreetName VARCHAR(50),
  PostalCode VARCHAR(7),
  CityName VARCHAR(30) NOT NULL,
  PRIMARY KEY (HouseNumber,StreetName,PostalCode)
  );
 
CREATE TABLE Restaurant(
  BusinessNumber INT PRIMARY KEY,
  HouseNumber INT,
  StreetName VARCHAR(50),
  PostalCode VARCHAR(7),
  Name VARCHAR(50),
  OwnerId INT,
  FOREIGN KEY (HouseNumber,StreetName,PostalCode) REFERENCES Address ON DELETE SET NULL,
  FOREIGN KEY (PostalCode) REFERENCES Postal_Area,
  FOREIGN KEY (OwnerId) REFERENCES Owner ON DELETE SET NULL
  );

CREATE TABLE Menu_Item_Type(
  Type VARCHAR(30) PRIMARY KEY
  );
 
CREATE TABLE offers(
  BusinessNumber INT,
  Type VARCHAR(30),
  PRIMARY KEY (BusinessNumber,Type),
  FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE,
  FOREIGN KEY (Type) REFERENCES Menu_Item_Type
  );
 
CREATE TABLE Menu_Item(
  BusinessNumber INT,
  Name VARCHAR(50),
  Type VARCHAR(30) NOT NULL,
  Cost DECIMAL(7,2),
  PRIMARY KEY (BusinessNumber, Name),
  FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE,
  FOREIGN KEY (Type) REFERENCES Menu_Item_Type
  );
 
CREATE TABLE Review(
  ReviewNumber INT PRIMARY KEY,
  Content VARCHAR(4000),
  UserId VARCHAR(30),
  FOREIGN KEY (UserId) REFERENCES Review_User ON DELETE SET NULL
  );
 
CREATE TABLE Restaurant_Review(
  ReviewNumber INT NOT NULL,
  BusinessNumber INT DEFAULT -1 NOT NULL,
  AmbienceRating INT,
  CleanlinessRating INT,
  ServiceRating INT,
  FOREIGN KEY (ReviewNumber) REFERENCES Review ON DELETE CASCADE,
  FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE
  );

CREATE TABLE Menu_Item_Review(
  ReviewNumber INT NOT NULL,
  BusinessNumber INT DEFAULT -1 NOT NULL,
  MenuItemName VARCHAR(50) DEFAULT 'N/A' NOT NULL,
  PresentationRating INT,
  TasteRating INT,
  PortionSizeRating INT,
  FOREIGN KEY (BusinessNumber, MenuItemName) REFERENCES Menu_Item ON DELETE CASCADE,
  FOREIGN KEY (ReviewNumber) REFERENCES Review ON DELETE CASCADE,
  FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE
  );

CREATE TABLE Helpful_Tag(
  TagID INT PRIMARY KEY,
  HelpfulnessRating INT NOT NULL,
  ReviewNumber INT,
  UserId VARCHAR(30),
  FOREIGN KEY (ReviewNumber) REFERENCES Review ON DELETE SET NULL,
  FOREIGN KEY (UserId) REFERENCES Review_User ON DELETE SET NULL
  );

-- INSERT STATEMENTS
INSERT INTO City(Name, Province_State, Country) VALUES ('Vancouver', 'British Columbia', 'Canada');
INSERT INTO City(Name, Province_State, Country) VALUES ('Richmond', 'British Columbia', 'Canada');
INSERT INTO City(Name, Province_State, Country) VALUES ('Toronto', 'Ontario', 'Canada');
INSERT INTO City(Name, Province_State, Country) VALUES ('Ottawa', 'Ontario', 'Canada');
INSERT INTO City(Name, Province_State, Country) VALUES ('Los Angeles', 'California', 'United States of America');

INSERT INTO Review_User(UserId,Name,CityName,Province_State) VALUES ('user1','John','Toronto','Ontario');
INSERT INTO Review_User(UserId,Name,CityName,Province_State) VALUES ('user2','Jane','Los Angeles','California');
INSERT INTO Review_User(UserId,Name,CityName,Province_State) VALUES ('user3','Kentaro','Vancouver','British Columbia');
INSERT INTO Review_User(UserId,Name,CityName,Province_State) VALUES ('user4','Tony','Vancouver','British Columbia');
INSERT INTO Review_User(UserId,Name,CityName,Province_State) VALUES ('user5','Riley','Vancouver','British Columbia');
INSERT INTO Review_User(UserId,Name,CityName,Province_State) VALUES ('user6','ChatGPT','Vancouver','British Columbia');

INSERT INTO Follows(UserId1, UserId2) VALUES ('user1', 'user2');
INSERT INTO Follows(UserId1, UserId2) VALUES('user3', 'user4');
INSERT INTO Follows(UserId1, UserId2) VALUES('user1', 'user3');
INSERT INTO Follows(UserId1, UserId2) VALUES('user4', 'user2');
INSERT INTO Follows(UserId1, UserId2) VALUES('user5', 'user6');

INSERT INTO Verified_User(UserId, VerificationNumber) VALUES ('user1', 1);
INSERT INTO Verified_User(UserId, VerificationNumber) VALUES ('user2', 2);
INSERT INTO Verified_User(UserId, VerificationNumber) VALUES ('user3', 3);
INSERT INTO Verified_User(UserId, VerificationNumber) VALUES ('user4', 4);
INSERT INTO Verified_User(UserId, VerificationNumber) VALUES ('user5', 5);


INSERT INTO Owner(SIN, Name) VALUES (123456789, 'Bob');
INSERT INTO Owner(SIN, Name) VALUES (456789123, 'Jick');
INSERT INTO Owner(SIN, Name) VALUES (789123456, 'Jane');
INSERT INTO Owner(SIN, Name) VALUES (987654321, 'Bob');
INSERT INTO Owner(SIN, Name) VALUES (654321987, 'Jane');

INSERT INTO Postal_Area(PostalCode, Province_State) VALUES ('V6T 1Z4', 'British Columbia');
INSERT INTO Postal_Area(PostalCode, Province_State) VALUES ('T2X 2L9', 'Alberta');
INSERT INTO Postal_Area(PostalCode, Province_State) VALUES ('V6B 1M8', 'British Columbia');
INSERT INTO Postal_Area(PostalCode, Province_State) VALUES ('K1A 0A9', 'Ontario');
INSERT INTO Postal_Area(PostalCode, Province_State) VALUES ('M5V 3L9', 'Ontario');

INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (601, 'W Hastings Street', 'V6B 1M8', 'Vancouver');
INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (2205, 'Lower Mall', 'V6T 1Z4', 'Vancouver');
INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (6363, 'Agronomy Road', 'V6T 1Z4', 'Vancouver');
INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (290, 'Bremner Blvd', 'M5V 3L9', 'Toronto');
INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (1, 'Wellington Street', 'K1A 0A9', 'Ottawa');

INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (123, 601, 'W Hastings Street', 'V6B 1M8', 'Bob''s Generic Pizza Place', 123456789);
INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (234, 2205, 'Lower Mall', 'V6T 1Z4', 'The Point', 789123456);
INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (345, 6363, 'Agronomy Road', 'V6T 1Z4', 'Orchard Commons', 456789123);
INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (456, 6363, 'Agronomy Road', 'V6T 1Z4', 'McDonalds', 654321987);
INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (999, 1, 'Wellington Street', 'K1A 0A9', 'Bob''s Underground Food Court', 987654321);
INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (909, 290, 'Bremner Blvd', 'M5V 3L9', 'Bob''s Sky High Food Court', 987654321);

INSERT INTO Menu_Item_Type(Type) VALUES ('Pizza');
INSERT INTO Menu_Item_Type(Type) VALUES ('Pasta');
INSERT INTO Menu_Item_Type(Type) VALUES ('Burgers');
INSERT INTO Menu_Item_Type(Type) VALUES ('Dim Sum');
INSERT INTO Menu_Item_Type(Type) VALUES ('Sushi');

INSERT INTO Offers(BusinessNumber, Type) VALUES (123, 'Pizza');
INSERT INTO Offers(BusinessNumber, Type) VALUES (234, 'Burgers');
INSERT INTO Offers(BusinessNumber, Type) VALUES (234, 'Pasta');
INSERT INTO Offers(BusinessNumber, Type) VALUES (345, 'Burgers');
INSERT INTO Offers(BusinessNumber, Type) VALUES (345, 'Dim Sum');
INSERT INTO Offers(BusinessNumber, Type) VALUES (456, 'Burgers');
INSERT INTO Offers(BusinessNumber, Type) VALUES (999, 'Dim Sum');
INSERT INTO Offers(BusinessNumber, Type) VALUES (999, 'Sushi');
INSERT INTO Offers(BusinessNumber, Type) VALUES (909, 'Pasta');

INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (123, 'Pepperoni Pizza', 'Pizza', 15.00);
INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (234, 'Cheeseburger', 'Burgers', 19.99);
INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (234, 'Lasagna', 'Pasta', 25.00);
INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (345, 'Dumplings', 'Dim Sum', 30.00);
INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (999, 'Shrimp wrappers', 'Dim Sum', 7.99);
INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (999, 'California Roll', 'Sushi', 4.99);
INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (909, 'Premium Spaghetti', 'Pasta', 40.00);

INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (1, 'it sucks', 'user1');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (2, 'it tastes good', 'user3');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (3, 'it is too spicy', 'user6');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (4, 'excited to try more', 'user4');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (5, 'way too overpriced', 'user5');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (6, 'the service was okay', 'user1');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (7, 'restaurant smelled bad', 'user2');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (8, 'i cannot seem to understand why they do not have enough staff', 'user5');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (9, 'I really liked their service', 'user4');
INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (10, 'The environment was nice', 'user6');

INSERT INTO Restaurant_Review(ReviewNumber, BusinessNumber, AmbienceRating, CleanlinessRating, ServiceRating) VALUES (6,999,3,4,2);
INSERT INTO Restaurant_Review(ReviewNumber, BusinessNumber, AmbienceRating, CleanlinessRating, ServiceRating) VALUES (7,234,1,2,5);
INSERT INTO Restaurant_Review(ReviewNumber, BusinessNumber, AmbienceRating, CleanlinessRating, ServiceRating) VALUES (8,456,1,1,1);
INSERT INTO Restaurant_Review(ReviewNumber, BusinessNumber, AmbienceRating, CleanlinessRating, ServiceRating) VALUES (9,234,4,3,5);
INSERT INTO Restaurant_Review(ReviewNumber, BusinessNumber, AmbienceRating, CleanlinessRating, ServiceRating) VALUES (10,123,5,5,5);

INSERT INTO Menu_Item_Review(ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating) VALUES (1, 999, 'Shrimp wrappers', 2,2,2);
INSERT INTO Menu_Item_Review(ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating) VALUES (2, 234, 'Cheeseburger', 5,5,5);
INSERT INTO Menu_Item_Review(ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating) VALUES (3, 345, 'Dumplings', 4,2,3);
INSERT INTO Menu_Item_Review(ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating) VALUES (4, 123, 'Pepperoni Pizza', 4,3,5);
INSERT INTO Menu_Item_Review(ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating) VALUES (5, 909, 'Premium Spaghetti', 1,2,1);

INSERT INTO Helpful_Tag(TagID, HelpfulnessRating, ReviewNumber, UserId) VALUES(1, 1, 3, 'user2');
INSERT INTO Helpful_Tag(TagID, HelpfulnessRating, ReviewNumber, UserId) VALUES(2, 0, 1, 'user6');
INSERT INTO Helpful_Tag(TagID, HelpfulnessRating, ReviewNumber, UserId) VALUES(3, 1, 7, 'user4');
INSERT INTO Helpful_Tag(TagID, HelpfulnessRating, ReviewNumber, UserId) VALUES(4, 1, 7, 'user6');
INSERT INTO Helpful_Tag(TagID, HelpfulnessRating, ReviewNumber, UserId) VALUES(5, 0, 10, 'user1');

