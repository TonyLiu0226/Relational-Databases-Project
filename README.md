## CPSC 304 Project

This project is an application that allows the user to read and write reviews for restaurants.
However, the user is also allowed to read and write reviews for the food items themselves,
giving a better understanding on recommendations and foods to avoid.

# Deployment Instructions(Remote)

1. Clone the repository into using your ssh

2. Login with your ssh and cd to the project directory

3. Under src/.env, change the oracle user and pass to match your credentials

4. cd to src, then run the following command

```
sh ./remote-start.sh
```

5. The terminal should say something along the lines of Server running at http://localhost:50000/. Visit the link on your web browser.

# Additional Notes

- There were some commit issues for Kentaro Lim(44267326), so his name is listed as UBC student and klim10 for some commits

# Starting SQL Server(for testing)

1. In termimal type the following:

```
sqlplus ora_USERNAME@stu
```

2. Then to type your password with the following format:

```
aSTUDENT_NUMBER
```

3. The SQL script for initializing the database is under

```
./src/scripts/restaurants.sql
```