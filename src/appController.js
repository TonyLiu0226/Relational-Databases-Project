const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.post("/init-db", async (req, res) => {
    const initiateResult = await appService.initializeDB();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// OWNER ROUTES

router.get('/owner', async (req, res) => {
    const tableContent = await appService.viewOwner();
    res.json({ data: tableContent });
});

router.post("/owner", async (req, res) => {
    const { sin, name } = req.body;
    const insertResult = await appService.insertOwner(sin, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete("/owner", async (req, res) => {
    const { sin } = req.body;
    const deleteResult = await appService.deleteOwner(sin);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

//User routes
router.post('/create_user', async (req, res) => {
    const { city, province, name, userid } = req.body;
    const createResult = await appService.createUser(city, province, name, userid);
    if (createResult == 1) {
        res.json({ success: true });
    }
    else if (createResult == -1) {
        res.json({ success: false, message: true});
    }
    else {
        res.status(500).json({ success: false, message: false });
    }
});

router.post('/search_user_by_id', async (req, res) => {
    const { UserId } = req.body;
    const searchResult = await appService.searchUserById(UserId);
    if (searchResult === undefined) {
        res.json({ success: false });
    }
    else if (searchResult.length) {
        res.json({ success: true, data: searchResult });
    }
    else {
        res.json({ success: true, data: [] });
    }
})

router.post('/search_user_by_name', async (req, res) => {
    const { UserName } = req.body;
    const searchResult = await appService.searchUserByName(UserName);
    if (searchResult === undefined) {
        res.json({ success: false });
    }
    else if (searchResult.length) {
        res.json({ success: true, data: searchResult });
    }
    else {
        res.json({ success: true, data: [] });
    }
})

router.post('/search_user_by_city', async (req, res) => {
    const { City, Province } = req.body;
    const searchResult = await appService.searchUserByCity(City, Province);
    if (searchResult === undefined) {
        res.json({ success: false });
    }
    else if (searchResult.length) {
        res.json({ success: true, data: searchResult });
    }
    else {
        res.json({ success: true, data: [] });
    }
})

router.post('/update_user', async (req, res) => {
    const { UserId, newName, newCity, newProvince } = req.body;
    const updateResult = await appService.updateUser(UserId, newName, newCity, newProvince);
    //should return true if one row is successfully updated
    if (updateResult) {
        res.json({ success: true })
    }
    //if nothing is updated or there is an error
    else {
        res.json({ success: false })
    }
})

router.delete('/delete_user', async (req, res) => {
    const { UserId } = req.body;
    const del = await appService.deleteUser(UserId);
    if (del >= 1) {
        res.json({ success: true, value: del })
    }
    else if (del == 0) {
        res.json({ success: true, value: 0 })
    }
    else {
        res.json({ success: false, value: null });
    }
})

//Follows routes
router.post('/add_to_follows', async (req, res) => {
    const { UserId1, UserId2 } = req.body;
    const createResult = await appService.AddToFollows(UserId1, UserId2);
    //success
    if (createResult == 1) {
        res.json({ success: true, data: createResult });
    }
    //failure
    else {
        res.json({ success: false, data: createResult });
    }
})

router.post('/view_follows', async (req, res) => {
    const { UserId1, UserId2, clause } = req.body;
    const searchResult = await appService.ViewFollows(UserId1, UserId2, clause);
    //success
    console.log(searchResult);
    if (searchResult !== undefined) {
        if (searchResult.length) {
            res.json({ success: true, data: searchResult});
        }
        //no results
        else {
            res.json({ success: true});
        }
    }
    //failure
    else {
        res.json({ success: false});
    }
})

router.delete('/delete_follows_pair', async (req, res) => {
    const { UserId1, UserId2 } = req.body;
    deleteResult = await appService.DeleteFromFollows(UserId1, UserId2);
    //success
    if (deleteResult == 1) {
        res.json({ success: true, data: deleteResult });
    }
    //failure
    else {
        res.json({ success: false, data: deleteResult });
    }
})

router.get('/cities', async (req, res) => {
    const result = await appService.loadCities();
    if (result.length) {
        res.json({ result: result });
    }
    else {
        res.json({ result: undefined });
    }
})

//VERIFICATION USER ROUTES
router.get('/verify_users', async (req, res) => {
    //gets all users with at least 4 reviews
    const eligibleUsers = await appService.getEligibleUsers();

    //for all users with at least 4 reviews, insert users that do not already exist in the database
    usersSuccessfullyInserted = []
    duplicateUsers = []
    errorUsers = []

    if (eligibleUsers !== undefined) {
        if (eligibleUsers.length) {
            for (let i = 0; i < eligibleUsers.length; i++) {
                const result = await appService.createVerifiedUser(eligibleUsers[i][0]);
                //successfully add new user to verified users
                if (result == 1) {
                    usersSuccessfullyInserted.push(eligibleUsers[i][0]);
                }
                //user already exists in verified users
                else if (result == -1) {
                    duplicateUsers.push(eligibleUsers[i][0]);
                }
                //we encountered an error while trying to insert the user
                else {
                    errorUsers.push(eligibleUsers[i][0])
                }
            }
            //if encountered any errors for any users in eligibleUsers, return false as operation did not succeed
            //however keep the users that have been successfully inserted
            if (errorUsers.length) {
                res.json({ success: false, data: { successfulUsers: usersSuccessfullyInserted, duplicateUsers: duplicateUsers, errors: errorUsers } });
            }
            else {
                res.json({ success: true, data: { successfulUsers: usersSuccessfullyInserted, duplicateUsers: duplicateUsers, errors: [] } });
            }
        }
        //nothing to insert, no users are eligible!
        else {
            res.json({ success: true })
        }
    }
    //if encountered any errors while initially fetching eligibleUsers, return false with empty data set
    else {
        res.json({ success: false })
    }
})

router.get('/get_verified_users', async (req, res) => {
    const users = await appService.getVerifiedUsers();
    if (users !== undefined) {
        if (users.length) {
            res.json({ success: true, data: users })
        }
        else {
            res.json({ success: true })
        }
    }
    else {
        res.json({ success: false })
    }
})

//PROJECTION ROUTES
router.get('/tables', async (req, res) => {
    const tableNames = await appService.viewTables();
    //if tables are returned
    if (tableNames.length) {
        res.json({ success: true, result: tableNames });
    }
    //error for sure if no tables are returned
    else {
        res.json({ success: false });
    }
})

router.post('/attributes', async (req, res) => {
    const { tableName } = req.body;
    const attributes = await appService.getAttributes(tableName);
    //successful if attributes are returned
    if (attributes.length) {
        res.json({ success: true, result: attributes });
    }
    //all tables have attributes, so if nothing is returned something is wrong for sure
    else {
        res.json({ success: false });
    }
})

router.post('/project', async (req, res) => {
    const { tableName, queryAttributes } = req.body;
    const results = await appService.Project(tableName, queryAttributes);
    if (results !== undefined) {
        if (results.length) {
            res.json({ success: true, data: results });
        }
        else {
            res.json({ success: true });
        }
    }
    else {
        res.json({ success: false });
    }
})

// MENU ITEM ROUTES

router.get('/menu-items', async (req, res) => {
    const menuItems = await appService.viewMenuItems();
    res.json({ data: menuItems });
});


router.post('/menu-items', async (req, res) => {
    const { businessNumber, name, type, cost } = req.body;
    const insertResult = await appService.insertMenuItem(businessNumber, name, type, cost);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/menu-items', async (req, res) => {
    const { businessNumber, name } = req.body;
    const deleteResult = await appService.deleteMenuItem(businessNumber, name);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/edit-menu-items', async (req, res) => {
    const { businessNumber, name, newCost } = req.body;
    const result = await appService.editMenuItem(businessNumber, name, newCost);
    if (result) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// MENU ITEM REVIEW ROUTES

router.get('/menu-item-reviews', async (req, res) => {
    const menuItemReviews = await appService.viewMenuItemReviews();
    res.json({ data: menuItemReviews });
});

router.post('/menu-item-reviews', async (req, res) => {
    const { reviewNumber, businessNumber, menuItemName, presentationRating, tasteRating, portionSizeRating, content, userId } = req.body;

    const insertResult = await appService.insertMenuItemReview(
        reviewNumber, businessNumber, menuItemName, presentationRating, tasteRating, portionSizeRating, content, userId
    );

    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/menu-item-reviews', async (req, res) => {
    const { reviewNumber } = req.body;
    const deleteResult = await appService.deleteMenuItemReview(reviewNumber);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// Restaurant Routes

router.get('/restaurant', async (req, res) => {
    const tableContent = await appService.viewRestaurant();
    res.json({ data: tableContent });
});

router.post("/restaurant", async (req, res) => {
    const { businessNumber, houseNumber, streetName, postalCode, cityName, name, ownerId } = req.body;
    const insertResult = await appService.insertRestaurant(businessNumber, houseNumber, streetName, postalCode, cityName, name, ownerId);
    if (insertResult.success) {
        res.json({ success: true });
    } else {
        res.status(500).json(insertResult);
    }
});

router.delete("/restaurant", async (req, res) => {
    const { businessNumber } = req.body;
    const deleteResult = await appService.deleteRestaurant(businessNumber);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.put("/restaurant", async (req, res) => {
    const { businessNumber, houseNumber, streetName, postalCode, cityName, name, ownerId } = req.body;
    const updateResult = await appService.editRestaurant(businessNumber, houseNumber, streetName, postalCode, cityName, name, ownerId);
    if (updateResult.sucess) {
        res.json({ success: true });
    } else {
        res.status(500).json(updateResult);
    }
});

// Restaurant Review Routes

router.get('/restaurant-review', async (req, res) => {
    const { type, value } = req.query;
    const response = await appService.viewRestaurantReview(type, value);
    res.json(response);
});

router.post("/restaurant-review", async (req, res) => {
    const { reviewNumber, businessNumber, userId, ambienceRating, cleanlinessRating, serviceRating, content } = req.body;
    const insertResult = await appService.insertRestaurantReview(reviewNumber, businessNumber, userId, ambienceRating, cleanlinessRating, serviceRating, content);
    if (insertResult.success) {
        res.json({ success: true });
    } else {
        res.status(500).json(insertResult);
    }
});
// aggregate group by
router.get('/cheapest-menu-items-by-type', async (req, res) => {
    const cheapestMenuItemsByType = await appService.getCheapestMenuItemsByType();
    res.json({ data: cheapestMenuItemsByType });
});

router.get('/most-expensive-menu-items-by-type', async (req, res) => {
    const mostExpensiveMenuItemsByType = await appService.getMostExpensiveMenuItemsByType();
    res.json({ data: mostExpensiveMenuItemsByType });
});


// division
router.get('/restaurants-with-all-menu-item-types', async (req, res) => {
    const selectedTypes = req.query.types ? req.query.types.split(',') : [];
    const restaurantsWithAllTypes = await appService.getRestaurantsWithAllMenuItemTypes(selectedTypes);
    res.json({ data: restaurantsWithAllTypes });
});


router.delete("/restaurant-review", async (req, res) => {
    const { reviewNumber } = req.body;
    const deleteResult = await appService.deleteRestaurantReview(reviewNumber);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.put("/restaurant-review", async (req, res) => {
    const { reviewNumber, ambienceRating, cleanlinessRating, serviceRating, content } = req.body;
    const updateResult = await appService.editRestaurantReview(reviewNumber, ambienceRating, cleanlinessRating, serviceRating, content);
    if (updateResult.sucess) {
        res.json({ success: true });
    } else {
        res.status(500).json(updateResult);
    }
})

module.exports = router;