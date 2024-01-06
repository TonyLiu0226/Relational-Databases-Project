const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};

// ----------------------------------------------------------

// async function init() {
//     try {
//         await oracledb.createPool({
//             ...dbConfig
//         })
//     } catch (error) {
//         console.log(error);
//     } finally {
//         await oracledb.closeConnection([300]);
//     }
// };

// async function exit() {
//     try {
//         await oracledb.getPool().close(0);
//     } catch (error) {

//     }
// };

// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        return await action(connection);
    } catch (err) {
        console.log("ERROR WITH CONNECTION");
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function initializeDB() {
    return await withOracleDB(async (connection) => {
        const tables = ['Follows', 'Verified_User', 'offers', 'Restaurant_Review', 'Menu_Item_Review', 'Helpful_Tag',
            'Review', 'Menu_Item', 'Menu_Item_Type', 'Restaurant', 'Postal_Area', 'Address', 'Owner', 'Review_User', 'City'
        ]
        for (let i = 0; i < tables.length; i++) {
            try {
                await connection.execute(`drop table ${tables[i]}`);
            } catch (error) {
            }
        }
        //Script to create all tables
        await connection.execute(`
            CREATE TABLE City(
                Name VARCHAR(30),
                Province_State VARCHAR(30),
                Country VARCHAR(30),
                PRIMARY KEY(Name, Province_State)
            )
        `);
        await connection.execute(`
            CREATE TABLE Review_User(
                UserId VARCHAR(30) PRIMARY KEY,
                Name VARCHAR(30),
                CityName VARCHAR(30) NOT NULL,
                Province_State VARCHAR(30) NOT NULL,
                FOREIGN KEY (CityName, Province_State) REFERENCES City
            )
        `);
        await connection.execute(`
            CREATE TABLE Follows(
                UserId1 VARCHAR(30) NOT NULL,
                UserId2 VARCHAR(30) NOT NULL,
                PRIMARY KEY(UserId1,UserId2),
                FOREIGN KEY (UserId1) REFERENCES Review_User ON DELETE CASCADE,
                FOREIGN KEY (UserId2) REFERENCES Review_User ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE Verified_User(
                UserId VARCHAR(30) NOT NULL,
                VerificationNumber INT UNIQUE,
                FOREIGN KEY (UserId) REFERENCES Review_User ON DELETE CASCADE
            )
        `);
        await connection.execute(`
            CREATE TABLE Owner(
                SIN INT PRIMARY KEY,
                Name VARCHAR(30)
            )
        `);
        await connection.execute(`
            CREATE TABLE Postal_Area(
                PostalCode VARCHAR(7) PRIMARY KEY,
                Province_State VARCHAR(30)
                )
        `);
        await connection.execute(`
            CREATE TABLE Address(
                HouseNumber INT,
                StreetName VARCHAR(50),
                PostalCode VARCHAR(7),
                CityName VARCHAR(30) NOT NULL,
                PRIMARY KEY (HouseNumber,StreetName,PostalCode)
                )
        `);
        await connection.execute(`
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
                )
        `);
        await connection.execute(`
            CREATE TABLE Menu_Item_Type(
                Type VARCHAR(30) PRIMARY KEY
                )
        `);
        await connection.execute(`
            CREATE TABLE offers(
                BusinessNumber INT,
                Type VARCHAR(30),
                PRIMARY KEY (BusinessNumber,Type),
                FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE,
                FOREIGN KEY (Type) REFERENCES Menu_Item_Type
                )
        `);
        await connection.execute(`
            CREATE TABLE Menu_Item(
                BusinessNumber INT,
                Name VARCHAR(50),
                Type VARCHAR(30) NOT NULL,
                Cost DECIMAL(7,2),
                PRIMARY KEY (BusinessNumber, Name),
                FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE,
                FOREIGN KEY (Type) REFERENCES Menu_Item_Type
                )
        `);
        await connection.execute(`
            CREATE TABLE Review(
                ReviewNumber INT PRIMARY KEY,
                Content VARCHAR(4000),
                UserId VARCHAR(30),
                FOREIGN KEY (UserId) REFERENCES Review_User ON DELETE SET NULL
                )
        `);
        await connection.execute(`
            CREATE TABLE Restaurant_Review(
                ReviewNumber INT NOT NULL,
                BusinessNumber INT DEFAULT -1 NOT NULL,
                AmbienceRating INT,
                CleanlinessRating INT,
                ServiceRating INT,
                FOREIGN KEY (ReviewNumber) REFERENCES Review ON DELETE CASCADE,
                FOREIGN KEY (BusinessNumber) REFERENCES Restaurant ON DELETE CASCADE
                )
        `);
        
        await connection.execute(`
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
                )
        `);
        await connection.execute(`
            CREATE TABLE Helpful_Tag(
                TagID INT PRIMARY KEY,
                HelpfulnessRating INT NOT NULL,
                ReviewNumber INT,
                UserId VARCHAR(30),
                FOREIGN KEY (ReviewNumber) REFERENCES Review ON DELETE SET NULL,
                FOREIGN KEY (UserId) REFERENCES Review_User ON DELETE SET NULL
                )
        `);
        try {
            const cities = [
                { Name: 'Vancouver', Province_State: 'British Columbia', Country: 'Canada' },
                { Name: 'Richmond', Province_State: 'British Columbia', Country: 'Canada' },
                { Name: 'Toronto', Province_State: 'Ontario', Country: 'Canada' },
                { Name: 'Ottawa', Province_State: 'Ontario', Country: 'Canada' },
                { Name: 'Los Angeles', Province_State: 'California', Country: 'United States of America' },
            ];
            await connection.executeMany(`INSERT INTO City(Name, Province_State, Country) VALUES (:Name, :Province_State, :Country)`, cities, { autoCommit: true });

            const review_users = [
                { UserID: 'user1', Name: 'John', CityName: 'Toronto', Province_State: 'Ontario' },
                { UserID: 'user2', Name: 'Jane', CityName: 'Los Angeles', Province_State: 'California' },
                { UserID: 'user3', Name: 'Kentaro', CityName: 'Vancouver', Province_State: 'British Columbia' },
                { UserID: 'user4', Name: 'Tony', CityName: 'Vancouver', Province_State: 'British Columbia' },
                { UserID: 'user5', Name: 'Riley', CityName: 'Vancouver', Province_State: 'British Columbia' },
                { UserID: 'user6', Name: 'ChatGPT', CityName: 'Vancouver', Province_State: 'British Columbia' },
            ];
            await connection.executeMany(`INSERT INTO Review_User(UserID, Name, CityName, Province_State) VALUES (:UserID, :Name, :CityName, :Province_State)`, review_users, { autoCommit: true });

            const follows = [
                { UserID1: 'user1', UserID2: 'user2' },
                { UserID1: 'user3', UserID2: 'user4' },
                { UserID1: 'user1', UserID2: 'user3' },
                { UserID1: 'user4', UserID2: 'user2' },
                { UserID1: 'user5', UserID2: 'user6' },
            ];
            await connection.executeMany(`INSERT INTO Follows(UserID1, UserId2) VALUES (:UserID1, :UserID2)`, follows, { autoCommit: true });

            const verified_users = [
                { UserID: 'user1', VerificationNumber: 1 },
                { UserID: 'user2', VerificationNumber: 2 },
                { UserID: 'user3', VerificationNumber: 3 },
                { UserID: 'user4', VerificationNumber: 4 },
                { UserID: 'user5', VerificationNumber: 5 },
            ];
            await connection.executeMany(`INSERT INTO Verified_User(UserID, VerificationNumber) VALUES (:UserID, :VerificationNumber)`, verified_users, { autoCommit: true });

            const owners = [
                { SIN: 123456789, Name: 'Bob' },
                { SIN: 456789123, Name: 'Jick' },
                { SIN: 789123456, Name: 'Jick' },
                { SIN: 987654321, Name: 'Bob' },
                { SIN: 654321987, Name: 'Jane' },
            ];
            await connection.executeMany(`INSERT INTO Owner(SIN, Name) VALUES (:SIN, :Name)`, owners, { autoCommit: true });

            const postal_areas = [
                { PostalCode: 'V6T 1Z4', Province_State: 'British Columbia' },
                { PostalCode: 'T2X 2L9', Province_State: 'Alberta' },
                { PostalCode: 'V6B 1M8', Province_State: 'British Columbia' },
                { PostalCode: 'K1A 0A9', Province_State: 'Ontario' },
                { PostalCode: 'M5V 3L9', Province_State: 'Ontario' },
            ];
            await connection.executeMany(`INSERT INTO Postal_Area(PostalCode, Province_State) VALUES (:PostalCode, :Province_State)`, postal_areas, { autoCommit: true });

            const addresses = [
                { HouseNumber: 601, StreetName: 'W Hastings Street', PostalCode: 'V6B 1M8', CityName: 'Vancouver' },
                { HouseNumber: 2205, StreetName: 'Lower Mall', PostalCode: 'V6T 1Z4', CityName: 'Vancouver' },
                { HouseNumber: 6363, StreetName: 'Agronomy Road', PostalCode: 'V6T 1Z4', CityName: 'Vancouver' },
                { HouseNumber: 290, StreetName: 'Bremner Blvd', PostalCode: 'M5V 3L9', CityName: 'Toronto' },
                { HouseNumber: 1, StreetName: 'Wellington Street', PostalCode: 'K1A 0A9', CityName: 'Ottawa' },
            ];
            await connection.executeMany(`INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (:HouseNumber, :StreetName, :PostalCode, :CityName)`, addresses, { autoCommit: true });

            const restaurants = [
                { BusinessNumber: 123, HouseNumber: 601, StreetName: 'W Hastings Street', PostalCode: 'V6B 1M8', Name: `Bob's Generic Pizza Place`, OwnerId: 123456789 },
                { BusinessNumber: 234, HouseNumber: 2205, StreetName: 'Lower Mall', PostalCode: 'V6T 1Z4', Name: `The Point`, OwnerId: 789123456 },
                { BusinessNumber: 345, HouseNumber: 6363, StreetName: 'Agronomy Road', PostalCode: 'V6T 1Z4', Name: `Orchard Commons`, OwnerId: 456789123 },
                { BusinessNumber: 456, HouseNumber: 6363, StreetName: 'Agronomy Road', PostalCode: 'V6T 1Z4', Name: `McDonalds`, OwnerId: 654321987 },
                { BusinessNumber: 999, HouseNumber: 1, StreetName: 'Wellington Street', PostalCode: 'K1A 0A9', Name: `Bob's Underground Food Court`, OwnerId: 987654321 },
                { BusinessNumber: 909, HouseNumber: 290, StreetName: 'Bremner Blvd', PostalCode: 'M5V 3L9', Name: `Bob's Sky High Food Court`, OwnerId: 987654321 },
            ];
            await connection.executeMany(`INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (:BusinessNumber, :HouseNumber, :StreetName, :PostalCode, :Name, :OwnerId)`, restaurants, { autoCommit: true });

            const menu_item_types = [
                { Type: 'Pizza' },
                { Type: 'Pasta' },
                { Type: 'Burgers' },
                { Type: 'Dim Sum' },
                { Type: 'Sushi' },
            ];
            await connection.executeMany(`INSERT INTO Menu_Item_Type(Type) VALUES (:Type)`, menu_item_types, { autoCommit: true });

            const offers = [
                { BusinessNumber: 123, Type: 'Pizza' },
                { BusinessNumber: 234, Type: 'Burgers' },
                { BusinessNumber: 234, Type: 'Pasta' },
                { BusinessNumber: 345, Type: 'Burgers' },
                { BusinessNumber: 345, Type: 'Dim Sum' },
                { BusinessNumber: 456, Type: 'Burgers' },
                { BusinessNumber: 999, Type: 'Dim Sum' },
                { BusinessNumber: 999, Type: 'Sushi' },
                { BusinessNumber: 909, Type: 'Pasta' },
            ];
            await connection.executeMany(`INSERT INTO Offers(BusinessNumber, Type) VALUES (:BusinessNumber, :Type)`, offers, { autoCommit: true });

            const menu_items = [
                { BusinessNumber: 123, Name: 'Pepperoni Pizza', Type: 'Pizza', Cost: 15.00 },
                { BusinessNumber: 234, Name: 'Cheeseburger', Type: 'Burgers', Cost: 19.99 },
                { BusinessNumber: 234, Name: 'Lasagna', Type: 'Pasta', Cost: 25.00 },
                { BusinessNumber: 345, Name: 'Dumplings', Type: 'Dim Sum', Cost: 30.00 },
                { BusinessNumber: 999, Name: 'Shrimp wrappers', Type: 'Dim Sum', Cost: 7.99 },
                { BusinessNumber: 999, Name: 'California Roll', Type: 'Sushi', Cost: 4.99 },
                { BusinessNumber: 909, Name: 'Premium Spaghetti', Type: 'Pasta', Cost: 40.00 },
            ];
            await connection.executeMany(`INSERT INTO Menu_Item(BusinessNumber, Name, Type, Cost) VALUES (:BusinessNumber, :Name, :Type, :Cost)`, menu_items, { autoCommit: true });

            const reviews = [
                { ReviewNumber: 1, Content: 'it sucks', UserId: 'user1' },
                { ReviewNumber: 2, Content: 'it tastes good', UserId: 'user3' },
                { ReviewNumber: 3, Content: 'it is too spicy', UserId: 'user6' },
                { ReviewNumber: 4, Content: 'excited to try more', UserId: 'user4' },
                { ReviewNumber: 5, Content: 'way too overpriced', UserId: 'user5' },
                { ReviewNumber: 6, Content: 'the service was okay', UserId: 'user1' },
                { ReviewNumber: 7, Content: 'restaurant smelled bad', UserId: 'user2' },
                { ReviewNumber: 8, Content: `i can't seem to understand why they do not have enough staff`, UserId: 'user5' },
                { ReviewNumber: 9, Content: 'I really liked their service', UserId: 'user4' },
                { ReviewNumber: 10, Content: 'The environment was nice', UserId: 'user6' },
            ];
            await connection.executeMany(`INSERT INTO Review(ReviewNumber, Content, UserId) VALUES (:ReviewNumber, :Content, :UserId)`, reviews, { autoCommit: true });

            const restaurant_reviews = [
                { ReviewNumber: 6, BusinessNumber: 999, AmbienceRating: 3, CleanlinessRating: 4, ServiceRating: 2 },
                { ReviewNumber: 7, BusinessNumber: 234, AmbienceRating: 1, CleanlinessRating: 2, ServiceRating: 5 },
                { ReviewNumber: 8, BusinessNumber: 456, AmbienceRating: 1, CleanlinessRating: 1, ServiceRating: 1 },
                { ReviewNumber: 9, BusinessNumber: 234, AmbienceRating: 4, CleanlinessRating: 3, ServiceRating: 5 },
                { ReviewNumber: 10, BusinessNumber: 123, AmbienceRating: 5, CleanlinessRating: 5, ServiceRating: 5 },
            ];
            await connection.executeMany(`INSERT INTO Restaurant_Review(ReviewNumber, BusinessNumber, AmbienceRating, CleanlinessRating, ServiceRating) VALUES (:ReviewNumber,:BusinessNumber,:AmbienceRating,:CleanlinessRating,:ServiceRating)`, restaurant_reviews, { autoCommit: true });


            const menu_item_reviews = [
                { ReviewNumber: 1, BusinessNumber: 999, MenuItemName: 'Shrimp wrappers', PresentationRating: 2, TasteRating: 2, PortionSizeRating: 2 },
                { ReviewNumber: 2, BusinessNumber: 234, MenuItemName: 'Cheeseburger', PresentationRating: 5, TasteRating: 5, PortionSizeRating: 5 },
                { ReviewNumber: 3, BusinessNumber: 345, MenuItemName: 'Dumplings', PresentationRating: 4, TasteRating: 2, PortionSizeRating: 3 },
                { ReviewNumber: 4, BusinessNumber: 123, MenuItemName: 'Pepperoni Pizza', PresentationRating: 4, TasteRating: 3, PortionSizeRating: 5 },
                { ReviewNumber: 5, BusinessNumber: 909, MenuItemName: 'Premium Spaghetti', PresentationRating: 1, TasteRating: 2, PortionSizeRating: 1 },
            ];
            await connection.executeMany(`INSERT INTO Menu_Item_Review(ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating) VALUES (:ReviewNumber, :BusinessNumber, :MenuItemName, :PresentationRating,:TasteRating,:PortionSizeRating)`, menu_item_reviews, { autoCommit: true });

            const helpful_tags = [
                { TagID: 1, HelpfulnessRating: 1, ReviewNumber: 3, UserId: 'user2' },
                { TagID: 2, HelpfulnessRating: 0, ReviewNumber: 1, UserId: 'user6' },
                { TagID: 3, HelpfulnessRating: 1, ReviewNumber: 7, UserId: 'user4' },
                { TagID: 4, HelpfulnessRating: 1, ReviewNumber: 7, UserId: 'user6' },
                { TagID: 5, HelpfulnessRating: 0, ReviewNumber: 10, UserId: 'user1' },
            ]
            await connection.executeMany(`INSERT INTO Helpful_Tag(TagID, HelpfulnessRating, ReviewNumber, UserId) VALUES(:TagID, :HelpfulnessRating, :ReviewNumber, :UserId)`, helpful_tags, { autoCommit: true });
        } catch (error) {
            console.log('Error inserting data', error);
        }
        return true;
    }).catch(() => {
        return false;
    });
}

//Owner functions

async function viewOwner() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Owner');
        return result.rows;
    }).catch((err) => {
        console.log(err);
        return [];
    });
}

async function insertOwner(sin, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Owner (Sin, Name) VALUES (:sin, :name)`,
            [sin, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteOwner(sin) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Owner WHERE Sin=:sin`,
            [sin],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    })
}

//user functions
async function createUser(city, province, name, userid) {
    try {
        return await withOracleDB(async (connection) => {
            //check to make sure we are not inserting duplicate user
            const checkIfUserExists = await connection.execute(
                `SELECT * FROM Review_User WHERE (UserId = :userid)`, [userid]
            );
            if (checkIfUserExists.rows.length) {
                return -1;
            }
            const result = await connection.execute(
                `INSERT INTO Review_User (UserId, Name, CityName, Province_State) VALUES (:userid, :name, :city, :province)`,
                [userid, name, city, province],
                { autoCommit: true },
            )
            if (result.rowsAffected && result.rowsAffected > 0) {
                return 1;
            }
            else {
                return 0;
            }
        })
    }
    catch (error) {
        console.error(error);
        return 0;
    }
}

async function searchUserById(UserId) {
    try {
        return await withOracleDB(async (connection) => {
            const users = await connection.execute(
                `SELECT * FROM Review_User NATURAL LEFT OUTER JOIN Verified_User WHERE UPPER(UserId) LIKE '%'|| :UserId ||'%'`, [UserId],
                { autoCommit: true },
            )
            return users.rows;
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

async function searchUserByName(UserName) {
    try {
        return await withOracleDB(async (connection) => {
            const users = await connection.execute(
                `SELECT * FROM Review_User NATURAL LEFT OUTER JOIN Verified_User WHERE UPPER(Name) LIKE '%'|| :UserName ||'%'`, [UserName],
                { autoCommit: true },
            )
            return users.rows;
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

async function searchUserByCity(City, Province) {
    try {
        return await withOracleDB(async (connection) => {
            const users = await connection.execute(
                `SELECT UserId, Name FROM Review_User WHERE CityName = :City AND Province_State =:Province`, [City, Province],
                { autoCommit: true },
            )
            return users.rows;
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

//UPDATE USER
async function updateUser(UserId, newName, newCity, newProvince) {
    try {
        //case 1: update just name
        if (newName.length && !(newCity.length || newProvince.length)) {
            return await withOracleDB(async (connection) => {
                const update = await connection.execute(
                    `UPDATE Review_User SET Name = :newName WHERE UserId = :UserId`, [newName, UserId],
                    { autoCommit: true },
                )
                //returns success if updates the row corresponding to the UserId
                return update.rowsAffected && update.rowsAffected > 0;
            })
        }
        //case 2: update just city and province
        if (!newName.length && (newCity.length && newProvince.length)) {
            return await withOracleDB(async (connection) => {
                const update = await connection.execute(
                    `UPDATE Review_User SET CityName = :newCity, Province_State = :newProvince WHERE UserId = :UserId`,
                    [newCity, newProvince, UserId],
                    { autoCommit: true },
                )
                //returns success if updates the row corresponding to the UserId
                return update.rowsAffected && update.rowsAffected > 0;
            })
        }
        //case 3: update all
        else {
            return await withOracleDB(async (connection) => {
                const update = await connection.execute(
                    `UPDATE Review_User SET Name = :newName, CityName = :newCity, Province_State = :newProvince WHERE UserId = :UserId`,
                    [newName, newCity, newProvince, UserId],
                    { autoCommit: true },
                )
                //returns success if updates the row corresponding to the UserId
                return update.rowsAffected && update.rowsAffected > 0;
            })
        }
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

async function deleteUser(UserId) {
    try {
        return await withOracleDB(async (connection) => {
            const deletedUser = await connection.execute(
                `DELETE FROM Review_User WHERE UserId = :UserId`, [UserId],
                { autoCommit: true },
            )
            return deletedUser.rowsAffected;
        })
    }
    catch (error) {
        console.error(error);
        return -1;
    }
}

//Follows
async function AddToFollows(UserId1, UserId2) {
    try {
        return await withOracleDB(async (connection) => {
            //error checking
            const checkUserId1 = await connection.execute(
                `SELECT * FROM Review_User WHERE UserId = :UserId1`, [UserId1],
                { autoCommit: true }
            );
            if (!checkUserId1.rows.length) {
                return (-1);
            }
            const checkUserId2 = await connection.execute(
                `SELECT * FROM Review_User WHERE UserId = :UserId2`, [UserId2],
                { autoCommit: true }
            );
            if (!checkUserId2.rows.length) {
                return (-2);
            }
            const checkIfAlreadyFollowEachOther = await connection.execute(
                `SELECT * FROM Follows WHERE UserId1 = :UserId1 AND UserId2 = :UserId2`, [UserId1, UserId2],
                { autoCommit: true }
            );
            if (checkIfAlreadyFollowEachOther.rows.length) {
                return (0);
            }

            //actual insertion
            const result = await connection.execute(
                `INSERT INTO Follows(UserId1, UserId2) Values (:UserId1, :UserId2)`, [UserId1, UserId2],
                { autoCommit: true },
            )
            if (result.rowsAffected && result.rowsAffected > 0) {
                return (1);
            }
            else {
                throw new Error("Failed to insert");
            }
        })
    }
    catch (error) {
        console.error(error);
        return (undefined);
    }
}

async function ViewFollows(UserId1, UserId2, clause) {
    try {
        return await withOracleDB(async (connection) => {
            //both userids are provided
            if (UserId1.length && UserId2.length) {
                const result = await connection.execute(
                    clause == 'AND' ? `SELECT UserId1, USERID2 FROM Follows WHERE UserId1 = :UserId1 AND UserId2 = :UserId2`
                        : `SELECT UserId1, USERID2 FROM Follows WHERE UserId1 = :UserId1 OR UserId2 = :UserId2`, [UserId1, UserId2],
                )
                return result.rows;
            }
            //no userid2 is provided
            else if (UserId1.length && !(UserId2.length)) {
                const result = await connection.execute(`SELECT UserId1, USERID2 FROM Follows WHERE UserId1 = :UserId1`, [UserId1],
                )
                return result.rows;
            }
            //no userid1 is provided
            else if (UserId2.length && !(UserId1.length)) {
                const result = await connection.execute(`SELECT UserId1, USERID2 FROM Follows WHERE UserId2 = :UserId2`, [UserId2],
                )
                return result.rows;
            }
            //neither userid is provided
            else {
                const result = await connection.execute(`SELECT UserId1, USERID2 FROM Follows`)
                return result.rows;
            }
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

async function DeleteFromFollows(UserId1, UserId2) {
    try {
        return await withOracleDB(async (connection) => {

            //error checking
            const checkUserId1 = await connection.execute(
                `SELECT * FROM Review_User WHERE UserId = :UserId1`, [UserId1],
                { autoCommit: true }
            );
            if (!checkUserId1.rows.length) {
                return (-1);
            }
            const checkUserId2 = await connection.execute(
                `SELECT * FROM Review_User WHERE UserId = :UserId2`, [UserId2],
                { autoCommit: true }
            );
            if (!checkUserId2.rows.length) {
                return (-2);
            }

            //actual deletion
            const result = await connection.execute(
                `DELETE FROM Follows WHERE (UserId1 = :UserId1 AND UserId2 = :UserId2)`, [UserId1, UserId2],
                { autoCommit: true },
            )
            if (result.rowsAffected && result.rowsAffected > 0) {
                return (1);
            }
            else {
                return (0);
            }
        })
    }
    catch (error) {
        console.error(error);
        return (undefined);
    }
}

//CITIES
async function loadCities() {
    try {
        return await withOracleDB(async (connection) => {
            const cities = await connection.execute(
                `SELECT Name, Province_State FROM City`,
            );
            return cities.rows;
        })
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

//VERIFY USERS
//gets users that are eligible for verification
async function getEligibleUsers() {
    try {
        return await withOracleDB(async (connection) => {
            const users = await connection.execute(
                `SELECT UserId FROM Review_User WHERE (SELECT COUNT(*) FROM Review WHERE Review.UserId = Review_User.UserId) > 3`,
            );
            return users.rows;
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

//creates a new verified user tuple
async function createVerifiedUser(UserId) {
    try {
        return await withOracleDB(async (connection) => {
            //check to see if user is already verified. If so, immediately return
            const doesUserExist = await connection.execute(
                `SELECT * FROM Verified_User WHERE UserId =: UserId`, [UserId],
            )
            if (doesUserExist.rows.length) {
                return -1;
            }
            //generate a value for verificationNumber
            let random = -1;
            let numGenerated = false;
            while (!numGenerated) {
                random = Math.floor(Math.random() * 1000000);
                const doesNumberExist = await connection.execute(
                    `SELECT * FROM Verified_User WHERE VerificationNumber =: random`, [random],
                )
                if (!doesNumberExist.rows.length) {
                    numGenerated = true;
                    break;
                }
            }
            //insert new verified user with the verification number
            const insertUser = await connection.execute(
                `INSERT INTO Verified_User(UserId, VerificationNumber) VALUES (:UserId, :random)`, [UserId, random],
                { autoCommit: true },
            )
            if (insertUser.rowsAffected && insertUser.rowsAffected > 0) {
                return 1;
            }
            else {
                return 0;
            }
        })

    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

//fetches all verified users
async function getVerifiedUsers() {
    try {
        return await withOracleDB(async (connection) => {
            const users = await connection.execute(
                `SELECT * FROM Verified_User`
            )
            return users.rows;
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

//PROJECTION FUNCTIONS
//get all tables in the database
async function viewTables() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT table_name FROM user_tables');
        return result.rows;
    }).catch((err) => {
        console.log(err);
        return [];
    });
}

//get attributes from a predefined table
async function getAttributes(tableName) {
    try {
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(`
            SELECT column_name
            FROM all_tab_columns
            WHERE table_name = :tableName`, [tableName]);
            return result.rows;
        })
    }
    catch (error) {
        console.error(error);
        return [];
    }
}

//projects data from selected table with given attributes
async function Project(tableName, queryAttributes) {
    try {
        queryString = queryAttributes.join(', ')
        console.log(queryString);
        console.log(tableName);
        return await withOracleDB(async (connection) => {
            const result = await connection.execute(`
            SELECT ${queryString}
            FROM ${tableName}`);
            return result.rows;
        })
    }
    catch (error) {
        console.error(error);
        return undefined;
    }
}

// Menu Item functions

async function viewMenuItems() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Menu_Item');
        return result.rows;
    }).catch((err) => {
        console.log(err);
        return [];
    });
}

async function insertMenuItem(businessNumber, name, type, cost) {

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Menu_Item (BusinessNumber, Name, Type, Cost) VALUES (:businessNumber, :name, :type, :cost)`,
            [businessNumber, name, type, cost],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function deleteMenuItem(businessNumber, name) {

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Menu_Item WHERE BusinessNumber=:businessNumber AND Name=:name`,
            [businessNumber, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}


async function editMenuItem(businessNumber, name, newCost) {

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Menu_Item SET Cost = :newCost WHERE BusinessNumber = :businessNumber AND Name = :name`,
            { businessNumber: businessNumber, name: name, newCost: newCost },
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// menu item review functions

async function insertMenuItemReview(reviewNumber, businessNumber, menuItemName, presentationRating, tasteRating, portionSizeRating, content, userId) {

    return await withOracleDB(async (connection) => {
        // Insert review first
        const reviewResult = await connection.execute(
            `INSERT INTO Review (ReviewNumber, Content, UserId) VALUES (:reviewNumber, :content, :userId)`,
            { reviewNumber: reviewNumber, content: content, userId: userId },
            { autoCommit: true }
        );

        // If review insertion is successful, proceed to insert menu item review
        if (reviewResult.rowsAffected && reviewResult.rowsAffected > 0) {
            const menuItemReviewResult = await connection.execute(
                `INSERT INTO Menu_Item_Review (ReviewNumber, BusinessNumber, MenuItemName, PresentationRating, TasteRating, PortionSizeRating)
                 VALUES (:reviewNumber, :businessNumber, :menuItemName, :presentationRating, :tasteRating, :portionSizeRating)`,
                {
                    reviewNumber: reviewNumber, businessNumber: businessNumber, menuItemName: menuItemName,
                    presentationRating: presentationRating, tasteRating: tasteRating, portionSizeRating: portionSizeRating
                },
                { autoCommit: true }
            );

            return menuItemReviewResult.rowsAffected && menuItemReviewResult.rowsAffected > 0;
        } else {
            return false;
        }
    }).catch(() => {
        return false;
    });
}

async function deleteMenuItemReview(reviewNumber) {

    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM Menu_Item_Review WHERE ReviewNumber=:reviewNumber`,
            [reviewNumber],
            { autoCommit: true }
        );

        if (result.rowsAffected && result.rowsAffected > 0) {
            // If successful, also delete the corresponding review
            const reviewResult = await connection.execute(
                `DELETE FROM Review WHERE ReviewNumber=:reviewNumber`,
                [reviewNumber],
                { autoCommit: true }
            );

            return reviewResult.rowsAffected && reviewResult.rowsAffected > 0;
        } else {
            return false;
        }
    }).catch(() => {
        return false;
    });
}

async function viewMenuItemReviews() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT mir.*, r.Content FROM Menu_Item_Review mir 
        JOIN Review r ON mir.ReviewNumber = r.ReviewNumber`);
        return result.rows;
    }).catch((err) => {
        console.log(err);
        return [];
    });
}

async function viewRestaurant() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`SELECT R.BusinessNumber as BusinessNumber,R.Name as Name, O.Name as Owner, CONCAT(CONCAT(CONCAT(CONCAT(R.HouseNumber,' '),R.StreetName),' '),R.PostalCode) as HouseNumber,C.Name as City 
        FROM Restaurant R, Owner O, Address A, Postal_Area PA, City C 
        WHERE R.OwnerId = O.SIN AND R.HouseNumber = A.HouseNumber AND R.StreetName = A.StreetName AND R.PostalCode = A.PostalCode AND R.PostalCode = PA.PostalCode AND A.CityName = C.Name AND PA.Province_State = C.Province_State`);
        return result.rows;
    }).catch((err) => {
        console.log(err);
        return [];
    });
}

async function insertRestaurant(businessNumber, houseNumber, streetName, postalCode, cityName, name, ownerId) {
    return await withOracleDB(async (connection) => {
        const postal_area = await connection.execute(`SELECT Province_State FROM Postal_Area WHERE PostalCode = :postalCode`,
            [postalCode]
        );
        if (postal_area.rows.length == 0) {
            return { success: false, message: 'Postal area does not exist!' };
        };
        const province_State = postal_area.rows[0][0];
        const city = await connection.execute(`SELECT * FROM City WHERE Name = :cityName AND Province_State = :province_State`,
            [cityName, province_State]
        );
        if (city.rows.length == 0) {
            return { success: false, message: 'City does not exist!' };
        }
        const address = await connection.execute(`SELECT * FROM Address WHERE HouseNumber = :houseNumber AND StreetName = :streetname AND PostalCode = :postalCode`,
            [houseNumber, streetName, postalCode]
        );
        if (address.rows.length == 0) {
            await connection.execute(
                `INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (:houseNumber, :streetName, :postalCode, :cityName)`,
                [houseNumber, streetName, postalCode, cityName],
                { autoCommit: true }
            );
        } else {
            return { success: false, message: 'There is already a restaurant with the same address!' };
        }
        const owner = await connection.execute(`SELECT * FROM Owner WHERE Sin=:ownerId`,
            [ownerId]
        );
        if (owner.rows.length == 0) {
            return { success: false, message: 'Cannot find owner with matching sin!' };
        };
        const restaurantResult = await connection.execute(
            `INSERT INTO Restaurant(BusinessNumber, HouseNumber, StreetName, PostalCode, Name, OwnerId) VALUES (:businessNumber, :houseNumber, :streetName, :postalCode, :name, :ownerId)`,
            [businessNumber, houseNumber, streetName, postalCode, name, ownerId],
            { autoCommit: true }
        );

        return { success: restaurantResult.rowsAffected && restaurantResult.rowsAffected > 0, message: '' };
    }).catch((err) => {
        console.log(err);
        return { success: false, message: 'Could not insert restaurant!' };
    });
}

async function deleteRestaurant(businessNumber) {
    return await withOracleDB(async (connection) => {
        const address = await connection.execute(`SELECT R.HouseNumber, R.StreetName, R.PostalCode,C.Name
        FROM Restaurant R, Address A, Postal_Area PA, City C
        WHERE R.HouseNumber = A.HouseNumber AND R.StreetName = A.StreetName AND R.PostalCode = A.PostalCode AND R.PostalCode = PA.PostalCode AND A.CityName = C.Name AND PA.Province_State = C.Province_State AND R.BusinessNumber=:BusinessNumber`,
            [businessNumber]
        );
        if (address.rows.length == 0) {
            return false;
        }
        address = address.rows[0];
        await connection.execute(
            `DELETE FROM Restaurant WHERE BusinessNumber=:businessNumber`,
            [businessNumber],
            { autoCommit: true }
        );
        await connection.execute(
            `DELETE FROM Address WHERE HouseNumber=:houseNumber AND StreetName=:streetName AND PostalCode=:postalCode AND CityName=:cityName`,
            [...address],
            { autoCommit: true }
        );

        return true;
    }).catch(() => {
        return false;
    })
}

async function editRestaurant(businessNumber, houseNumber, streetName, postalCode, cityName, name, ownerId) {
    return await withOracleDB(async (connection) => {
        // Fetch previous restaurant in form [BusinessNumber,Name,OwnerId,HouseNumber,StreetName,PostalCode,CityName,Province_State]
        let outdatedRestaurant = await connection.execute(`SELECT R.BusinessNumber,R.Name, R.OwnerId, R.HouseNumber, R.StreetName, R.PostalCode,C.Name, PA.Province_State
        FROM Restaurant R, Address A, Postal_Area PA, City C
        WHERE R.HouseNumber = A.HouseNumber AND R.StreetName = A.StreetName AND R.PostalCode = A.PostalCode AND R.PostalCode = PA.PostalCode AND A.CityName = C.Name AND PA.Province_State = C.Province_State AND R.BusinessNumber=:BusinessNumber`,
            [businessNumber]
        );
        if (outdatedRestaurant.rows.length == 0) {
            return { success: false, message: 'Could not find restaurant with given business number!' }
        }
        outdatedRestaurant = outdatedRestaurant.rows[0];
        let updatedRestaurant = [...outdatedRestaurant];
        if (postalCode) { // If we are changing postal codes
            const postal_area = await connection.execute(`SELECT * FROM Postal_Area WHERE PostalCode = :postalCode`,
                [postalCode]
            );
            if (postal_area.rows.length == 0) {
                return { success: false, message: 'Postal area does not exist!' };
            };
            updatedRestaurant[5] = postal_area.rows[0][0];
            updatedRestaurant[7] = postal_area.rows[0][1];
        }
        if (houseNumber) updatedRestaurant[3] = houseNumber;
        if (streetName) updatedRestaurant[4] = streetName;
        if (postalCode || houseNumber || streetName) { // Create new address
            const address = await connection.execute(`SELECT * FROM Address WHERE HouseNumber = :houseNumber AND StreetName = :streetname AND PostalCode = :postalCode`,
                [updatedRestaurant[3], updatedRestaurant[4], updatedRestaurant[5]]
            );
            if (address.rows.length == 0) {
                await connection.execute(
                    `DELETE FROM Address WHERE HouseNumber=:houseNumber AND StreetName=:streetName AND PostalCode=:postalCode AND CityName=:cityName`,
                    [outdatedRestaurant[3], outdatedRestaurant[4], outdatedRestaurant[5], outdatedRestaurant[6]],
                    { autoCommit: true }
                );
                await connection.execute(
                    `INSERT INTO Address(HouseNumber, StreetName, PostalCode, CityName) VALUES (:houseNumber, :streetName, :postalCode, :cityName)`,
                    [updatedRestaurant[3], updatedRestaurant[4], updatedRestaurant[5], cityName ? cityName : updatedRestaurant[6]],
                    { autoCommit: true }
                );
            } else {
                return { success: false, message: 'There is already a restaurant with the same address!' };
            }
        }
        if (cityName) { // If we are changing cities
            const city = await connection.execute(`SELECT * FROM City WHERE Name = :cityName AND Province_State = :province_State`,
                [cityName, updatedRestaurant[7]]
            );
            if (city.rows.length == 0) {
                return { success: false, message: 'City does not exist!' };
            }
            updatedRestaurant[6] = cityName;
        };
        if (ownerId) {
            const owner = await connection.execute(`SELECT * FROM Owner WHERE SIN = :sin`,
                [ownerId]
            );
            if (owner.rows.length == 0) {
                return { success: false, message: 'Owner does not exist!' };
            }
            updatedRestaurant[2] = ownerId;
        }
        if (name) {
            updatedRestaurant[1] = name;
        }
        const restaurantResult = await connection.execute(
            `
            UPDATE Restaurant
            SET Name=:Name, OwnerId=:OwnerId, HouseNumber=:HouseNumber, StreetName=:StreetName, PostalCode=:PostalCode
            WHERE BusinessNumber=:BusinessNumber
            `,
            [updatedRestaurant[1], updatedRestaurant[2], updatedRestaurant[3], updatedRestaurant[4], updatedRestaurant[5], updatedRestaurant[0]],
            { autoCommit: true }
        );
        return { success: restaurantResult.rowsAffected && restaurantResult.rowsAffected > 0, message: '' };
    }).catch(() => {
        return { success: false, message: 'Could not update restaurant!' };
    });
}

//Restaurant Review functions
async function viewRestaurantReview(type, value) {
    return await withOracleDB(async (connection) => {
        let result;
        let metadata;
        switch (type) {
            case 'user':
                result = await connection.execute(`SELECT RR.ReviewNumber,RR.BusinessNumber,Re.UserId,RR.AmbienceRating,RR.CleanlinessRating,RR.ServiceRating, Re.Content 
                FROM Restaurant_Review RR, Review Re
                WHERE RR.ReviewNumber = Re.ReviewNumber AND Re.UserId=:userId`,
                    [value]);
                if (result.rows.length == 0) {
                    return { success: false, message: "Could not find user with given ID!" };
                }
                metadata = await connection.execute(`SELECT Re.UserId, U.Name, COUNT(RR.ReviewNumber)
                FROM Restaurant_Review RR, Review Re, Review_User U
                WHERE RR.ReviewNumber = Re.ReviewNumber AND Re.UserId = U.UserId
                GROUP BY Re.UserId, U.Name
                HAVING Re.UserId = :userId`,
                    [value]);
                break;
            case 'restaurant':
                result = await connection.execute(`SELECT RR.ReviewNumber,RR.BusinessNumber,Re.UserId,RR.AmbienceRating,RR.CleanlinessRating,RR.ServiceRating, Re.Content 
                FROM Restaurant_Review RR, Review Re
                WHERE RR.ReviewNumber = Re.ReviewNumber AND RR.BusinessNumber=:businessNumber`,
                    [value]);
                if (result.rows.length == 0) {
                    return { success: false, message: "Could not find restaurant with given business number!" };
                }
                metadata = (await connection.execute(`SELECT RR.BusinessNumber, R.Name, COUNT(RR.ReviewNumber)
                FROM Restaurant_Review RR, Restaurant R
                WHERE RR.BusinessNumber = R.BusinessNumber
                GROUP BY RR.BusinessNumber, R.Name
                HAVING RR.BusinessNumber = :businessNumber`,
                    [value]));
                break;
            default:
                result = await connection.execute(`SELECT RR.ReviewNumber,RR.BusinessNumber,Re.UserId,RR.AmbienceRating,RR.CleanlinessRating,RR.ServiceRating, Re.Content 
                FROM Restaurant_Review RR, Review Re
                WHERE RR.ReviewNumber = Re.ReviewNumber`);
                break;
        }
        const modifiedRows = result.rows.map(row => {
            row.splice(6, 0, Math.round((row[3] + row[4] + row[5]) / 3));
            return row;
        });
        return {
            success: modifiedRows.length > 0,
            metadata: metadata ? metadata.rows[0] : null,
            rows: modifiedRows
        };
    }).catch((err) => {
        console.log(err);
        return {
            success: false,
            message: err,
            metadata: null,
            rows: []
        };
    });
}

async function insertRestaurantReview(reviewNumber, businessNumber, userId, ambienceRating, cleanlinessRating, serviceRating, content) {
    return await withOracleDB(async (connection) => {
        const review = await connection.execute(`SELECT * FROM Review where ReviewNumber = :reviewNumber`,
            [reviewNumber]
        )
        if (review.rows.length == 0) {
            await connection.execute(
                `INSERT INTO Review(ReviewNumber,Content,UserId) VALUES (:0,:1,:2)`,
                [reviewNumber, content, userId],
                { autoCommit: true }
            )
        } else {
            return { success: false, message: 'There is already a review with the same review number!' };
        }

        const restaurantReviewResult = await connection.execute(
            `INSERT INTO Restaurant_Review(ReviewNumber,BusinessNumber,AmbienceRating,CleanlinessRating,ServiceRating) VALUES (:0, :1, :2, :3, :4)`,
            [reviewNumber, businessNumber, ambienceRating, cleanlinessRating, serviceRating],
            { autoCommit: true }
        );

        return { success: restaurantReviewResult.rowsAffected && restaurantReviewResult.rowsAffected > 0, message: '' };
    }).catch((err) => {
        console.log(err);
        return { success: false, message: 'Could not insert restaurant review!' };
    });
}
// Aggregation group by 


async function getCheapestMenuItemsByType() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
    SELECT
      Type,
      BusinessNumber,
      Name,
      Cost
    FROM
      Menu_Item
    WHERE
      (Type, Cost) IN (
          SELECT
              Type,
              MIN(Cost) AS MinCost
          FROM
              Menu_Item
          GROUP BY
              Type
      )`
        );
        return result.rows;
    }).catch((err) => {
        console.error(err);
        return [];
    }).catch((err) => {
        return false;
    });
}

async function getMostExpensiveMenuItemsByType() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
        SELECT
          Type,
          BusinessNumber,
          Name,
          Cost
        FROM
          Menu_Item
        WHERE
          (Type, Cost) IN (
            SELECT
              Type,
              MAX(Cost) AS MaxCost
            FROM
              Menu_Item
            GROUP BY
              Type
          )`
        );
        return result.rows;
    }).catch((err) => {
        console.error(err);
        return [];
    });
}


// division


async function getRestaurantsWithAllMenuItemTypes(selectedTypes) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
      SELECT DISTINCT R.BusinessNumber, R.Name
      FROM Restaurant R
      WHERE NOT EXISTS (
        SELECT T.Type
        FROM Menu_Item_Type T
        WHERE NOT EXISTS (
          SELECT 1
          FROM Menu_Item M
          WHERE M.BusinessNumber = R.BusinessNumber AND M.Type = T.Type
        )${selectedTypes.length > 0 ? ` AND T.Type IN ('${selectedTypes.join("','")}')` : ''}
      )
    `);
        return result.rows;

    })
}


async function deleteRestaurantReview(reviewNumber) {
    return await withOracleDB(async (connection) => {
        const deleteResult1 = await connection.execute(
            `DELETE FROM Restaurant_Review WHERE ReviewNumber=:0`,
            [reviewNumber],
            { autoCommit: true }
        );
        const deleteResult2 = await connection.execute(
            `DELETE FROM Review WHERE ReviewNumber=:0`,
            [reviewNumber],
            { autoCommit: true }
        );

        return deleteResult1.rowsAffected && deleteResult1.rowsAffected > 0 && deleteResult2.rowsAffected && deleteResult2.rowsAffected > 0;
    }).catch(() => {
        return false;
    })
}

async function editRestaurantReview(reviewNumber, ambienceRating, cleanlinessRating, serviceRating, content) {
    return await withOracleDB(async (connection) => {
        if (ambienceRating || cleanlinessRating || serviceRating) {
            let previousReview = await connection.execute(`SELECT ambienceRating, cleanlinessRating, serviceRating FROM Restaurant_Review WHERE ReviewNumber=:0`, [reviewNumber]);
            if (previousReview.rows.length == 0) {
                return { success: false, message: 'No review with that review number exists!' };
            }
            previousReview = previousReview.rows[0];
            if (ambienceRating) previousReview[0] = ambienceRating;
            if (cleanlinessRating) previousReview[1] = cleanlinessRating;
            if (serviceRating) previousReview[2] = serviceRating;
            const restaurantReviewResult = await connection.execute(
                `
                UPDATE Restaurant_Review
                SET AmbienceRating=:0,CleanlinessRating=:1,serviceRating=:2
                WHERE ReviewNumber=:3
                `,
                [previousReview[0], previousReview[1], previousReview[2], reviewNumber],
                { autoCommit: true }
            );
            if (!restaurantReviewResult.rowsAffected || restaurantReviewResult.rowsAffected == 0) {
                return { success: false, message: 'No review was modified!' };
            }
        };
        if (content) {
            const review = await connection.execute(`SELECT * FROM Review where ReviewNumber = :reviewNumber`, [reviewNumber]);
            if (review.rows.length == 0) {
                return { success: false, message: 'No review with that review number exists!' };
            }
            const restaurantReviewResult = await connection.execute(
                `
                UPDATE Review
                SET Content=:0
                WHERE ReviewNumber=:1
                `,
                [content, reviewNumber],
                { autoCommit: true }
            );
            if (!restaurantReviewResult.rowsAffected || restaurantReviewResult.rowsAffected == 0) {
                return { success: false, message: 'No review was modified!' };
            }
        }

        return { success: true, message: '' };
    }).catch((err) => {
        console.log(err);
        return { success: false, message: 'Could not edit restaurant review!' };
    });
}

module.exports = {
    testOracleConnection,
    initializeDB,
    viewOwner,
    insertOwner,
    deleteOwner,
    viewMenuItems,
    insertMenuItem,
    deleteMenuItem,
    editMenuItem,
    createUser,
    searchUserById,
    searchUserByName,
    searchUserByCity,
    updateUser,
    deleteUser,
    AddToFollows,
    ViewFollows,
    DeleteFromFollows,
    loadCities,
    getEligibleUsers,
    createVerifiedUser,
    getVerifiedUsers,
    viewTables,
    getAttributes,
    Project,
    insertMenuItemReview,
    deleteMenuItemReview,
    viewMenuItemReviews,
    viewRestaurant,
    insertRestaurant,
    deleteRestaurant,
    editRestaurant,
    viewRestaurantReview,
    insertRestaurantReview,
    deleteRestaurantReview,
    editRestaurantReview,
    getCheapestMenuItemsByType,
    getRestaurantsWithAllMenuItemTypes,
    getMostExpensiveMenuItemsByType
};