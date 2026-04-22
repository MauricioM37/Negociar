DROP DATABASE IF EXISTS inge2;
create database inge2;
USE inge2;

CREATE TABLE role (
	role_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_name varchar(30) NOT NULL
);

CREATE TABLE user (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(150) NOT NULL,
    email VARCHAR(100),
	passwordhash VARCHAR(255),
    full_name VARCHAR(250) NOT NULL,
    role_id int,
    phone VARCHAR(20),
    address VARCHAR(50),
    active_state boolean DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);

 CREATE TABLE customer(
	customer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100),
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50),
    phone_number VARCHAR(20),
    address VARCHAR(150),
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE sale (
    sale_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id int,
    address VARCHAR(150),
    delivery_state ENUM('pendiente', 'confirmado', 'en proceso', 'en camino', 'finalizado', 'cancelado') NULL,
    total_price DECIMAL(10,2) NOT NULL,
    canceled_at TIMESTAMP NULL,
    customer_id int NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE category (
    category_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name varchar(150) NOT NULL
    );
    
    
CREATE TABLE supplier (
	supplier_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    supplier_name varchar(150) NOT NULL,
    cuil varchar(50),
    email varchar(50),
    phone_number varchar(50),
    active_state BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product (
    product_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    image_path varchar(500),
    price DECIMAL(10,2) NOT NULL,
    category_id int not null,
    supplier_id int null,
    active_state BOOLEAN NOT NULL DEFAULT TRUE,
    stock int unsigned not null,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);



CREATE TABLE sale_item (
	sale_item_id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sale_id  int  NOT NULL,
    product_id  int  NOT NULL,
    amount INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sale(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);