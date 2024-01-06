/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */



// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
        });
}

// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/init-db", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('reset-db-msg');
        messageElement.textContent = "Database initiated successfully!";
    } else {
        alert("Error initiating database!");
    }
}

//CITY FUNCTIONS: Runs on page load to load in all cities in our database
async function loadCities() {
    const citySelectors = document.getElementsByClassName("cityselector");
    const response = await fetch("/cities", {
        method: `GET`
    });
    const responseData = await response.json();
    if (responseData.result) {
        for (let i = 0; i < citySelectors.length; i++) {
            citySelectors[i].innerHTML = "";
            responseData.result.forEach(city => {
                const option = document.createElement("option");
                option.value = `${city[0]}, ${city[1]}`;
                option.text = `${city[0]}, ${city[1]}`;
                citySelectors[i].appendChild(option);
            });
        }
    }
    else {
        alert("ERROR LOADING IN CITIES, PLEASE TRY RELOADING THE PAGE!")
    }
}

//OWNER FUNCTIONS

async function fetchAndDisplayOwners() {
    const tableElement = document.getElementById('view-owner-table');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/owner', {
        method: 'GET'
    });

    const owners = (await response.json()).data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    owners.forEach(owner => {
        const row = tableBody.insertRow();
        owner.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'DELETE';
        deleteButton.className = 'delete-button';
        deleteCell.appendChild(deleteButton);
        deleteButton.onclick = async (event) => {
            await deleteRow('owner', {
                sin: owner[0],
            });
            fetchAndDisplayOwners();
        };
    });
}

// Inserts new records into the demotable.
async function insertOwner(event) {
    event.preventDefault();

    const sinValue = document.getElementById('insert-owner-sin').value;
    const nameValue = document.getElementById('insert-owner-name').value;

    const response = await fetch('/owner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sin: sinValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insert-owner-msg');

    if (responseData.success) {
        messageElement.textContent = "Owner created successfully!";
        fetchAndDisplayOwners();
    } else {
        messageElement.textContent = "Error creating owner!";
    }
}

// Restaurant Functions

async function fetchAndDisplayRestaurants() {
    const tableElement = document.getElementById('view-restaurant-table');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/restaurant', {
        method: 'GET'
    });

    const restaurants = (await response.json()).data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    restaurants.forEach(restaurant => {
        const row = tableBody.insertRow();
        restaurant.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'DELETE';
        deleteButton.className = 'delete-button';
        deleteCell.appendChild(deleteButton);
        deleteButton.onclick = async (event) => {
            await deleteRow('restaurant', {
                businessNumber: restaurant[0],
            });
            fetchAndDisplayRestaurants();
        };
    });
}

async function insertRestaurant(event) {
    event.preventDefault();

    const businessNumber = document.getElementById('insert-restaurant-business-number').value;
    const sin = document.getElementById('insert-restaurant-owner-sin').value;
    const name = document.getElementById('insert-restaurant-name').value;
    const houseNumber = document.getElementById('insert-restaurant-house-number').value;
    const streetName = document.getElementById('insert-restaurant-street-name').value;
    const postalCode = document.getElementById('insert-restaurant-postal-code').value;
    const city = document.getElementById('insert-restaurant-city').value;

    const response = await fetch('/restaurant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            businessNumber: businessNumber,
            houseNumber: houseNumber,
            streetName: streetName,
            postalCode: postalCode,
            cityName: city,
            name: name,
            ownerId: sin
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insert-restaurant-msg');

    if (responseData.success) {
        messageElement.textContent = "Restaurant created successfully!";
        fetchAndDisplayRestaurants();
    } else {
        messageElement.textContent = responseData.message.length > 0 ? responseData.message : "Error creating restaurant!";
    }
}
async function updateRestaurant(event) {
    event.preventDefault();

    const businessNumber = document.getElementById('update-restaurant-business-number').value;
    const sin = document.getElementById('update-restaurant-owner-sin').value;
    const name = document.getElementById('update-restaurant-name').value;
    const houseNumber = document.getElementById('update-restaurant-house-number').value;
    const streetName = document.getElementById('update-restaurant-street-name').value;
    const postalCode = document.getElementById('update-restaurant-postal-code').value;
    const city = document.getElementById('update-restaurant-city').value;

    const response = await fetch('/restaurant', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            businessNumber: businessNumber,
            houseNumber: houseNumber,
            streetName: streetName,
            postalCode: postalCode,
            cityName: city,
            name: name,
            ownerId: sin
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('update-restaurant-msg');

    if (responseData.success) {
        messageElement.textContent = "Restaurant updated successfully!";
        fetchAndDisplayRestaurants();
    } else {
        messageElement.textContent = responseData.message.length > 0 ? responseData.message : "Error updating restaurant!";
    }
}

// Restaurant Review Functions
async function fetchAndDisplayRestaurantReviews() {
    const tableElement = document.getElementById('view-restaurant-review-table');
    const tableBody = tableElement.querySelector('tbody');
    const searchType = document.getElementById('restaurant-review-search-select').value;
    const searchValue = document.getElementById('restaurant-review-search-input').value;
    const responseMsg = document.getElementById('restaurant-review-msg');
    const metaDataDiv = document.getElementById('restaurant-review-metadata');
    if (searchType != 'all' && searchValue == '') {
        responseMsg.textContent = 'Please input value if not selecting by ALL';
        return;
    };

    const response = await fetch(`/restaurant-review?type=${searchType}&value=${searchValue}`, {
        method: 'GET',
    });
    const responseData = (await response.json());
    const restaurantReviews = responseData.rows;
    const metaData = responseData.metadata;
    if (responseData.success) {
        responseMsg.textContent = 'Successfully loaded table';
    } else {
        responseMsg.textContent = responseData.message ? responseData.message : 'Error loading in table';
        return;
    }
    if (metaData) {
        metaDataDiv.textContent = metaData[1] + '(' + metaData[0] + ') has ' + metaData[2] + ' review(s)'
    } else {
        metaDataDiv.textContent = '';
    }
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    restaurantReviews.forEach(restaurantReview => {
        const row = tableBody.insertRow();
        restaurantReview.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'DELETE';
        deleteButton.className = 'delete-button';
        deleteCell.appendChild(deleteButton);
        deleteButton.onclick = async (event) => {
            await deleteRow('restaurant-review', {
                reviewNumber: restaurantReview[0],
            });
            fetchAndDisplayRestaurantReviews();
        };
    });
}

async function insertRestaurantReview(event) {
    event.preventDefault();

    const reviewNumber = document.getElementById('insert-restaurant-review-number').value;
    const businessNumber = document.getElementById('insert-restaurant-review-business-number').value;
    const userId = document.getElementById('insert-restaurant-review-user-id').value;
    const ambienceRating = document.getElementById('insert-restaurant-review-ambience-rating').value;
    const cleanlinessRating = document.getElementById('insert-restaurant-review-cleanliness-rating').value;
    const serviceRating = document.getElementById('insert-restaurant-review-service-rating').value;
    const content = document.getElementById('insert-restaurant-review-content').value;

    const response = await fetch('/restaurant-review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reviewNumber,
            businessNumber,
            userId,
            ambienceRating,
            cleanlinessRating,
            serviceRating,
            content
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insert-restaurant-review-msg');

    if (responseData.success) {
        messageElement.textContent = "Restaurant review created successfully!";
        fetchAndDisplayRestaurantReviews();
    } else {
        messageElement.textContent = responseData.message.length > 0 ? responseData.message : "Error creating restaurant review!";
    }
}

async function updateRestaurantReview(event) {
    event.preventDefault();

    const reviewNumber = document.getElementById('update-restaurant-review-number').value;
    const ambienceRating = document.getElementById('update-restaurant-review-ambience-rating').value;
    const cleanlinessRating = document.getElementById('update-restaurant-review-cleanliness-rating').value;
    const serviceRating = document.getElementById('update-restaurant-review-service-rating').value;
    const content = document.getElementById('update-restaurant-review-content').value;

    const response = await fetch('/restaurant-review', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reviewNumber,
            ambienceRating,
            cleanlinessRating,
            serviceRating,
            content
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('update-restaurant-review-msg');

    if (responseData.success) {
        messageElement.textContent = "Restaurant review updated successfully!";
        fetchAndDisplayRestaurantReviews();
    } else {
        messageElement.textContent = responseData.message.length > 0 ? responseData.message : "Error updating restaurant review!";
    }
}

// Generic functions

async function deleteRow(tableName, reqObj) {
    const response = await fetch('/' + tableName, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqObj)
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('delete-' + tableName + '-msg');

    if (responseData.success) {
        messageElement.textContent = tableName.substring(0, 1).toUpperCase() + tableName.substring(1) + " deleted successfully!";
    } else {
        messageElement.textContent = "Error deleting " + tableName.substring(0, 1).toUpperCase() + tableName.substring(1) + "!";
    }
}

//USER FUNCTIONS
//load in all users on page load
async function loadUsers() {
    const userSelectors = document.getElementsByClassName("userselector");
    const response = await fetch('/search_user_by_id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId: ''
        })
    })
    const responseData = await (response.json());
    if (responseData.success) {
        for (let i = 0; i < userSelectors.length; i++) {
            userSelectors[i].innerHTML = "";
            responseData.data.forEach(user => {
                const option = document.createElement("option");
                option.value = `${user[i]}`;
                option.text = `${user[i]}`;
                userSelectors[i].appendChild(option);
            });
        }
    }
    else {
        alert("Error loading in users, please refresh page");
    }
}

//create user
async function insertUser(event) {
    event.preventDefault();

    const cityString = document.getElementById('cities').value;
    const userid = document.getElementById('insert-userid').value;
    const userName = document.getElementById('insert-user-name').value;
    const city = cityString.split(',')[0];
    const province = cityString.split(',')[1].slice(1);

    const response = await fetch('/create_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            city: city,
            province: province,
            name: userName,
            userid: userid,
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insert-user-msg');

    console.log(responseData);
    if (responseData.success) {
        messageElement.textContent = "User Inserted Successfully! Please use 'search by UserId' function to verify results on the database.";
        fetchTableData();
        loadUsers();
    } else {
        if (responseData.message) {
            messageElement.textContent = `User ${userid} already exists, please enter a different username`;
        }
        else {
            messageElement.textContent = "Error inserting user!";
        }
    }
}

//search for user by id
async function searchUserById(event) {
    event.preventDefault();

    const searchString = document.getElementById('search-by-userid').value.toUpperCase();
    const tableElement = document.getElementById('view-user-table-1');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/search_user_by_id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId: searchString
        })
    });
    const responseData = (await response.json())
    const messageElement = document.getElementById('search-user-msg-1');
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    //failure
    if (!responseData.success) {
        messageElement.textContent = `Encountered error while fetching results for UserId ${document.getElementById('search-by-userid').value}`;
    }
    //successful with results
    else if (responseData.data.length) {
        messageElement.textContent = ''
        responseData.data.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    }
    //no results
    else {
        messageElement.textContent = `No results found for UserId ${document.getElementById('search-by-userid').value}`;
    }
}

//search for user by name
async function searchUserByName(event) {
    event.preventDefault();

    const searchString = document.getElementById('search-by-name').value.toUpperCase();
    const tableElement = document.getElementById('view-user-table-2');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/search_user_by_name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserName: searchString
        })
    });

    const responseData = (await response.json());
    const messageElement = document.getElementById('search-user-msg-2');
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    //failure
    if (!responseData.success) {
        messageElement.textContent = `Encountered error while fetching results for Name ${document.getElementById('search-by-name').value}`;
    }
    //successful with results
    else if (responseData.data.length) {
        messageElement.textContent = ''
        responseData.data.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    }
    //no results
    else {
        messageElement.textContent = `No results found for Name ${document.getElementById('search-by-name').value}`;
    }
}

//search for user by city. Will only return userID and name, not the full user data
async function searchUserByCity(event) {
    event.preventDefault();

    const cityString = document.getElementById('search-by-city').value.split(',')[0];
    const provinceString = document.getElementById('search-by-city').value.split(',')[1].slice(1);

    const tableElement = document.getElementById('view-user-table-3');
    const tableBody = tableElement.querySelector('tbody');


    const response = await fetch('/search_user_by_city', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            City: cityString,
            Province: provinceString
        })
    });

    const responseData = (await response.json());
    const messageElement = document.getElementById('search-user-msg-3');
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    //failure
    if (!responseData.success) {
        messageElement.textContent = `Encountered error while fetching results for City, Province ${document.getElementById('search-by-city').value}`;
    }
    //successful with results
    else if (responseData.data.length) {
        responseData.data.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    }
    //no results
    else {
        messageElement.textContent = `No results found for City, Province ${document.getElementById('search-by-city').value}`;
    }
}

async function updateUser(event) {
    event.preventDefault();

    const UserId = document.getElementById('userlist').value;
    const newName = document.getElementById('update-user-name').value;
    const newCityString = document.getElementById('update-city').value;
    const newCity = newCityString.split(',')[0];
    const newProvince = newCityString.split(',')[1].slice(1);

    const response = await fetch('/update_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId: UserId,
            newName: newName,
            newCity: newCity,
            newProvince: newProvince
        })
    });
    const responseData = await (response.json());
    const messageElement = document.getElementById('update-user-msg');
    if (responseData.success) {
        messageElement.textContent = `sucessfully updated ${UserId}. Please use "search by UserId" function if you want to verify results on database.`;
    }
    else {
        messageElement.textContent = `updating ${UserId} was unsuccessful due to an error`;
    }
}

async function deleteUser(event) {
    event.preventDefault();

    const UserId = document.getElementById('delete-user-userid').value;

    const response = await fetch('/delete_user', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId: UserId,
        })
    });

    const responseData = await (response.json());
    const messageElement = document.getElementById('delete-user-msg');
    if (responseData.success && responseData.value > 0) {
        messageElement.textContent = `Successfully deleted user with id ${UserId}. Please use 'search by UserId' function if you want to verify results on database.`;
        fetchTableData();
        loadUsers();
    }
    else if (responseData.success && responseData.value == 0) {
        messageElement.textContent = `No user with id ${UserId} exists!`;
    }
    else {
        messageElement.textContent = `Unable to delete user with id ${UserId}`;
    }

}

//FOLLOWS FUNCTIONS
async function follows(event) {
    event.preventDefault();

    const UserId1 = document.getElementById('follow-id-1').value;
    const UserId2 = document.getElementById('follow-id-2').value;

    const response = await fetch('/add_to_follows', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId1: UserId1,
            UserId2: UserId2
        })
    });

    const responseData = await (response.json());
    const messageElement = document.getElementById('follow-msg');

    //success
    if (responseData.success) {
        messageElement.textContent = `Successfully followed ${UserId2} from ${UserId1}`;
    }
    //failure: userid1 does not exist
    else if (responseData.data == -1) {
        messageElement.textContent = `${UserId1} does not exist`;
    }
    //failure: userid2 does not exist
    else if (responseData.data == -2) {
        messageElement.textContent = `${UserId2} does not exist`;
    }
    //failure: userid1 already follows userid2
    else if (responseData.data == 0) {
        messageElement.textContent = `${UserId1} already follows ${UserId2}`;
    }
    //failure: other
    else {
        messageElement.textContent = `${UserId1} is unable to follow ${UserId2}`;
    }

}

async function viewFollows(event) {
    event.preventDefault();
    const tableElement = document.getElementById('view-follow-table');
    const tableBody = tableElement.querySelector('tbody');

    const UserId1 = document.getElementById("view-follow-user-id-1").value;
    const UserId2 = document.getElementById("view-follow-user-id-2").value;
    const clause = document.getElementById("update-clause").value;

    const response = await fetch('/view_follows', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId1: UserId1,
            UserId2: UserId2,
            clause: clause,
        })
    });

    const responseData = await (response.json());
    const messageElement = document.getElementById("view-follow-msg");
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (!responseData.success) {
        messageElement.textContent = `Encounterred error fetching results.`
    }
    else {
        if (responseData.data) {
            responseData.data.forEach(user => {
                const row = tableBody.insertRow();
                user.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
            messageElement.textContent = "";
        }
        else {
            messageElement.textContent = `No entries found for UserId1 = ${UserId1} ${clause} UserId2 = ${UserId2}`;
        }
    }
}

async function deleteFromFollows(event) {
    event.preventDefault();

    const UserId1 = document.getElementById('delete-follow-user-id1').value;
    const UserId2 = document.getElementById('delete-follow-user-id2').value;

    const response = await fetch('/delete_follows_pair', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserId1: UserId1,
            UserId2: UserId2
        })
    });

    const responseData = await (response.json());
    const messageElement = document.getElementById('delete-follow-msg');

    //success
    if (responseData.success) {
        messageElement.textContent = `Successfully deleted the pair ${UserId1}, ${UserId2}`;
    }
    //failure: userid1 does not exist
    else if (responseData.data == -1) {
        messageElement.textContent = `${UserId1} does not exist`;
    }
    //failure: userid2 does not exist
    else if (responseData.data == -2) {
        messageElement.textContent = `${UserId2} does not exist`;
    }
    //failure: userid1 already follows userid2
    else if (responseData.data == 0) {
        messageElement.textContent = `${UserId1} does not follow ${UserId2}`;
    }
    //failure: other
    else {
        messageElement.textContent = `${UserId1} is unable to unfollow ${UserId2}`;
    }
}

//VERIFICATION USER
//get all verified users on page load
async function viewVerifiedUsers() {
    const tableElement = document.getElementById('view-verified-table');
    const messageElement = document.getElementById('view-verified-msg');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/get_verified_users', {
        method: 'GET'
    });

    const users = (await response.json());
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (users.success) {
        if (users.data) {
            users.data.forEach(user => {
                const row = tableBody.insertRow();
                user.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
            messageElement.textContent = '';
        }
        else {
            messageElement.textContent = 'No verified users in database';
        }
    }
    else {
        messageElement.textContent = 'Error fetching verified users';
    }

}

async function verifyUsers(event) {
    event.preventDefault();
    const messageElement = document.getElementById("verify-msg");
    const response = await fetch('/verify_users', {
        method: 'GET',
    })

    const responseData = await (response.json());

    if (!responseData.success) {
        if (!responseData.data) {
            messageElement.textContent = 'Encountered error while trying to fetch users eligible for verified status!';
        }
        else {
            messageElement.textContent = `Successfully verified the following users: ${responseData.data.successfulUsers.length ? responseData.data.successfulUsers : 'none'}.\n 
            The following eligible users are already verified: ${responseData.data.duplicateUsers.length ? responseData.data.duplicateUsers : 'none'}.\n
            Encountered an error trying to verify the following users: ${responseData.data.errors.length ? responseData.data.errors : 'none'}`;
        }
    }
    else {
        if (!responseData.data) {
            messageElement.textContent = 'No users are eligible for verified status at the moment.';
        }
        else {
            messageElement.textContent = `Successfully verified the following users: ${responseData.data.successfulUsers.length ? responseData.data.successfulUsers : 'none'}\n
            The following eligible users are already verified: ${responseData.data.duplicateUsers.length ? responseData.data.duplicateUsers : 'none'}`;
        }
    }
}

//PROJECTION
//get name of all tables in relation
async function getTables() {
    const tableSelectors = document.getElementsByClassName("tableselector");
    const response = await fetch("/tables", {
        method: `GET`
    });
    const responseData = await response.json();
    if (responseData.result) {
        for (let i = 0; i < tableSelectors.length; i++) {
            tableSelectors[i].innerHTML = "";
            responseData.result.forEach(table => {
                const option = document.createElement("option");
                option.value = `${table}`;
                option.text = `${table}`;
                tableSelectors[i].appendChild(option);
            });
        }
    }
    else {
        alert("ERROR LOADING IN TABLES, PLEASE TRY RELOADING THE PAGE!")
    }
}

//get all attributes in relation
async function getAttributes(event) {
    event.preventDefault();
    const tableName = document.getElementById('select-table').value;
    const messageElement = document.getElementById('table-msg');
    const titleElement = document.getElementById('attribute-title');
    const checkBoxElement = document.getElementById('checkbox-attribute');

    const tableElement = document.getElementById('projection-results');
    const tableBody = tableElement.querySelector('tbody');
    const tableHead = tableElement.querySelector('thead');
    //clear table from query results
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (tableHead) {
        tableHead.innerHTML = '';
    }
    const response = await fetch('/attributes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tableName: tableName
        })
    })
    const responseData = await response.json();
    if (responseData.result) {
        messageElement.textContent = '';
        //removes all checkbox options
        checkBoxElement.innerHTML = '';
        //sets title to the correct table
        titleElement.textContent = `Select attributes from ${tableName}`;
        for (let i = 0; i < responseData.result.length; i++) {
            const label = document.createElement("label");
            label.for = (`select-attribute-${i.toString()}`)
            label.textContent = `${responseData.result[i]}`
            const option = document.createElement("input");
            option.type = 'checkbox';
            option.id = `select-attribute-${i.toString()}`;
            option.name = `attribute-${i.toString()}`;
            option.className = 'attributeselector';
            option.value = `${responseData.result[i]}`;
            checkBoxElement.appendChild(label);
            label.appendChild(option);
        }
    }
    else {
        titleElement.textContent = '';
        messageElement.textContent = `Error fetching attributes for ${tableName}`;
    }
}

//does projection based on selected attributes
async function project(event) {
    event.preventDefault();
    const tableName = document.getElementById('attribute-title').textContent.split(' ')[3];
    const checkBoxes = document.getElementsByClassName('attributeselector');
    //appends value of all checkboxes that have been checked to list of attributes to query on
    let queryAttributes = []
    for (let i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            queryAttributes.push(checkBoxes[i].value);
        }
    }
    const response = await fetch('/project', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tableName: tableName,
            queryAttributes: queryAttributes
        })
    })
    const responseData = await response.json();
    const messageElement = document.getElementById('table-result-msg');
    const tableElement = document.getElementById('projection-results');
    const tableBody = tableElement.querySelector('tbody');
    const tableHead = tableElement.querySelector('thead');

    //clear table from query results
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    if (tableHead) {
        tableHead.innerHTML = '';
    }

    if (responseData.success) {
        if (responseData.data) {
            messageElement.textContent = '';
            //add table headings
            for (let j = 0; j < queryAttributes.length; j++) {
                const tableHeading = document.createElement('th');
                tableHeading.textContent = queryAttributes[j];
                tableHead.appendChild(tableHeading);
            }
            //add table body
            responseData.data.forEach(item => {
                const row = tableBody.insertRow();
                item.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
        }
        else {
            messageElement.textContent = 'No data to load for this query!';
        }
    }
    else {
        messageElement.textContent = `Encountered an error projecting over ${tableName}`;
    }
}

// MENU ITEM FUNCTIONS

async function fetchAndDisplayMenuItems() {
    const tableElement = document.getElementById('view-menu-item-table');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/menu-items', {
        method: 'GET'
    });

    const menuItems = (await response.json()).data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    menuItems.forEach(item => {
        const row = tableBody.insertRow();
        item.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Inserts new menu items into the menu item table.
async function insertMenuItem(event) {
    event.preventDefault();

    const businessNumberValue = document.getElementById('insert-item-business-number').value;
    const nameValue = document.getElementById('insert-item-name').value;
    const typeValue = document.getElementById('insert-item-type').value;
    const costValue = document.getElementById('insert-item-cost').value;

    const response = await fetch('/menu-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            businessNumber: businessNumberValue,
            name: nameValue,
            type: typeValue,
            cost: costValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insert-item-msg');

    if (responseData.success) {
        messageElement.textContent = "Menu item created successfully!";
        fetchAndDisplayMenuItems();
    } else {
        messageElement.textContent = "Error creating menu item!";
    }
}

async function editMenuItem(event) {
    event.preventDefault();

    const businessNumberValue = document.getElementById('edit-item-business-number').value;
    const nameValue = document.getElementById('edit-item-name').value;
    const newCostValue = document.getElementById('edit-item-new-cost').value;

    const response = await fetch('/edit-menu-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            businessNumber: businessNumberValue,
            name: nameValue,
            newCost: newCostValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('edit-item-msg');

    if (responseData.success) {
        messageElement.textContent = "Menu item edited successfully!";
        fetchAndDisplayMenuItems();
    } else {
        messageElement.textContent = "Error editing menu item!";
    }
}



// Deletes a menu item from the menu item table.
async function deleteMenuItem(event) {
    event.preventDefault();

    const businessNumberValue = document.getElementById('delete-item-business-number').value;
    const nameValue = document.getElementById('delete-item-name').value;

    const response = await fetch('/menu-items', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            businessNumber: businessNumberValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('delete-item-msg');

    if (responseData.success) {
        messageElement.textContent = "Menu item deleted successfully!";
        fetchAndDisplayMenuItems();
    } else {
        messageElement.textContent = "Error deleting menu item!";
    }
}

// Menu Item Review Functions


async function fetchAndDisplayMenuItemReviews() {
    const tableElement = document.getElementById('view-menu-item-review-table');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/menu-item-reviews', {
        method: 'GET'
    });

    const menuItemReviews = (await response.json()).data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    menuItemReviews.forEach(item => {
        const row = tableBody.insertRow();
        item.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Inserts new menu items into the menu item table.
async function insertMenuItemReview(event) {
    event.preventDefault();

    const reviewNumberValue = document.getElementById('insert-mreview-review-number').value;
    const businessNumberValue = document.getElementById('insert-mreview-business-number').value;
    const menuItemNameValue = document.getElementById('insert-mreview-name').value;
    const presentationRatingValue = document.getElementById('insert-mreview-presentation').value;
    const tasteRatingValue = document.getElementById('insert-mreview-taste').value;
    const portionSizeRatingValue = document.getElementById('insert-mreview-portion').value;
    const contentValue = document.getElementById('insert-mreview-content').value;
    const userIdValue = document.getElementById('insert-mreview-userId').value;

    const response = await fetch('/menu-item-reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reviewNumber: reviewNumberValue,
            businessNumber: businessNumberValue,
            menuItemName: menuItemNameValue,
            presentationRating: presentationRatingValue,
            tasteRating: tasteRatingValue,
            portionSizeRating: portionSizeRatingValue,
            content: contentValue,
            userId: userIdValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insert-mreview-msg');

    if (responseData.success) {
        messageElement.textContent = "Menu item review created successfully!";
        fetchAndDisplayMenuItemReviews();
    } else {
        messageElement.textContent = "Error creating menu item review!";
    }
}

async function deleteMenuItemReview(event) {
    event.preventDefault();

    const reviewNumberValue = document.getElementById('delete-mreview-review-number').value;

    const response = await fetch('/menu-item-reviews', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reviewNumber: reviewNumberValue

        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('delete-mreview-msg');

    if (responseData.success) {
        messageElement.textContent = "Menu item review deleted successfully!";
        fetchAndDisplayMenuItemReviews();
    } else {
        messageElement.textContent = "Error deleting menu item review!";
    }
}




// group by
async function fetchAndDisplayCheapestMenuItemsByType() {
    const tableElement = document.getElementById('view-cheapest-menu-items-table');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/cheapest-menu-items-by-type', {
        method: 'GET',
    });

    const cheapestMenuItems = (await response.json()).data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    cheapestMenuItems.forEach(item => {
        const row = tableBody.insertRow();
        Object.values(item).forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function fetchAndDisplayMostExpensiveMenuItemsByType() {
    const tableElement = document.getElementById('view-cheapest-menu-items-table');
    const tableBody = tableElement.querySelector('tbody');
    const response = await fetch('/most-expensive-menu-items-by-type', {
        method: 'GET',
    });

    const mostExpensiveMenuItems = (await response.json()).data;
    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    mostExpensiveMenuItems.forEach(item => {
        const row = tableBody.insertRow();
        Object.values(item).forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// division
function getSelectedMenuItemTypes() {
    const selectedTypes = [];
    const typeCheckboxes = document.querySelectorAll('.menu-type-checkbox');

    typeCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTypes.push(checkbox.value);
        }
    });

    return selectedTypes;
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = async function () {
    checkDbConnection();
    await delay(1000);
    loadCities();
    await delay(1000);
    loadUsers();
    await delay(1000);
    getTables();
    document.getElementById('loading-msg').className = 'hidden';
    document.getElementById('hidden-container').className = '';

    document.getElementById("reset-db-button").addEventListener("click", resetDemotable);
    document.getElementById("insert-owner-form").addEventListener("submit", insertOwner);
    // document.getElementById("delete-owner-form").addEventListener("submit", deleteOwner);
    document.getElementById('insert-user-form').addEventListener("submit", insertUser);
    document.getElementById('search-for-user-by-id-form').addEventListener("submit", searchUserById);
    document.getElementById('search-for-user-by-name-form').addEventListener("submit", searchUserByName);
    document.getElementById('search-for-user-by-city-form').addEventListener("submit", searchUserByCity);
    document.getElementById('update-user-form').addEventListener("submit", updateUser);
    document.getElementById('delete-user-form').addEventListener("submit", deleteUser);
    document.getElementById('follow-form').addEventListener("submit", follows);
    document.getElementById('view-follow-form').addEventListener("submit", viewFollows);
    document.getElementById('delete-from-follow-form').addEventListener("submit", deleteFromFollows);
    document.getElementById("verify-form").addEventListener("submit", verifyUsers);
    document.getElementById("table-select-form").addEventListener("submit", getAttributes);
    document.getElementById("attribute-select-form").addEventListener("submit", project);
    document.getElementById("insert-item-form").addEventListener("submit", insertMenuItem);
    document.getElementById("delete-item-form").addEventListener("submit", deleteMenuItem);
    document.getElementById("edit-item-form").addEventListener("submit", editMenuItem);
    document.getElementById("insert-mreview-form").addEventListener("submit", insertMenuItemReview);
    document.getElementById("delete-mreview-form").addEventListener("submit", deleteMenuItemReview);
    document.getElementById("insert-restaurant-form").addEventListener("submit", insertRestaurant);
    document.getElementById("update-restaurant-form").addEventListener("submit", updateRestaurant);
    document.getElementById("restaurant-review-search-button").addEventListener("click", fetchAndDisplayRestaurantReviews);
    document.getElementById("insert-restaurant-review-form").addEventListener("submit", insertRestaurantReview);
    document.getElementById("update-restaurant-review-form").addEventListener("submit", updateRestaurantReview);
    document.getElementById("owner-refresh-button").addEventListener("click", fetchAndDisplayOwners);
    document.getElementById("verified-user-refresh-button").addEventListener("click", viewVerifiedUsers);
    document.getElementById("menu-item-refresh-button").addEventListener("click", fetchAndDisplayMenuItems);
    document.getElementById("menu-item-review-refresh-button").addEventListener("click", fetchAndDisplayMenuItemReviews);
    document.getElementById("restaurant-refresh-button").addEventListener("click", fetchAndDisplayRestaurants);
    document.getElementById("restaurant-review-refresh-button").addEventListener("click", fetchAndDisplayRestaurantReviews);
    document.getElementById('view-cheapest-menu-items-button').addEventListener('submit', function (event) {
        event.preventDefault();
        fetchAndDisplayCheapestMenuItemsByType();
    });
    document.getElementById('view-most-expensive-menu-items-button').addEventListener('submit', function (event) {
        event.preventDefault();
        fetchAndDisplayMostExpensiveMenuItemsByType();
    });
    document.getElementById('view-most-expensive-menu-items-button').addEventListener('submit', function (event) {
        event.preventDefault();
        fetchAndDisplayMostExpensiveMenuItemsByType();
    });

    document.getElementById('view-restaurants-all-types-button').addEventListener('click', async () => {
        const selectedTypes = getSelectedMenuItemTypes();

        if (selectedTypes.length === 0) {
            // If no types are selected, display an alert
            alert('Please select at least one menu item type.');
            return;
        }

        const response = await fetch(`/restaurants-with-all-menu-item-types?types=${selectedTypes.join(',')}`, {
            method: 'GET',
        });

        const result = await response.json();
        const restaurantsWithAllTypes = result.data;
        const tableElement = document.getElementById('view-restaurants-all-types-table');
        const tableBody = tableElement.querySelector('tbody');
        const noResultsMessage = document.getElementById('no-results-message');

        // Always clear old, already fetched data before new fetching process.
        if (tableBody) {
            tableBody.innerHTML = '';
        }

        if (restaurantsWithAllTypes.length === 0) {
            // Display a message if no restaurants are found
            if (noResultsMessage) {
                noResultsMessage.textContent = 'No restaurants found with all the selected menu item types.';
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.textContent = '';
            }

            restaurantsWithAllTypes.forEach(restaurant => {
                const row = tableBody.insertRow();
                Object.values(restaurant).forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
        }
    });

};

//functions to toggle UI elements
function openTab(event, num) {

    // First hides all content related to searching for users
    let user_searching_contents = document.getElementsByClassName("search-for-user");
    for (let i = 0; i < user_searching_contents.length; i++) {
        user_searching_contents[i].style.display = "none";
    }

    //Then makes all the tabs not active
    tabs = document.getElementsByClassName("tab-active");
    for (let j = 0; j < tabs.length; j++) {
        tabs[j].className = "tab"
    }

    //then applies the active class onto the current tab based on num of event, and show the relevant content for the tab
    if (num == 1) {
        document.getElementById("search-user-1").style.display = "block";
        document.getElementById("tab1").className = "tab-active";
    }

    if (num == 2) {
        document.getElementById("search-user-2").style.display = "block";
        document.getElementById("tab2").className = "tab-active";
    }

    if (num == 3) {
        document.getElementById("search-user-3").style.display = "block";
        document.getElementById("tab3").className = "tab-active";
    }

}
