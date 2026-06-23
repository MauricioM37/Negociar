USE inge2;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_procesar_venta$$

CREATE PROCEDURE sp_procesar_venta(
    IN p_id_usuario INT,
    IN p_direccion VARCHAR(150),
    IN p_items JSON
)
BEGIN
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_id_venta INT;
    DECLARE v_id_producto INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_stock INT;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_id_usuario IS NULL OR NOT EXISTS (
        SELECT 1
        FROM usuario
        WHERE id_usuario = p_id_usuario
          AND estado_activo = TRUE
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario inválido';
    END IF;

    IF p_items IS NULL OR JSON_TYPE(p_items) <> 'ARRAY' OR JSON_LENGTH(p_items) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La venta no tiene items';
    END IF;

    START TRANSACTION;

    INSERT INTO venta (id_usuario, direccion, estado_entrega, precio_total)
    VALUES (p_id_usuario, p_direccion, 'pendiente', 0.00);

    SET v_id_venta = LAST_INSERT_ID();
    SET v_count = JSON_LENGTH(p_items);

    WHILE v_idx < v_count DO
        SET v_id_producto = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].productId'))) AS UNSIGNED);
        SET v_cantidad = CAST(JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', v_idx, '].cantidad'))) AS UNSIGNED);

        IF v_id_producto IS NULL OR v_cantidad IS NULL OR v_cantidad <= 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Item de venta inválido';
        END IF;

        SET v_precio = NULL;
        SET v_stock = NULL;

        SELECT precio, stock
        INTO v_precio, v_stock
        FROM producto
        WHERE id_producto = v_id_producto
          AND estado_activo = TRUE
        LIMIT 1
        FOR UPDATE;

        IF v_precio IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Producto inválido';
        END IF;

        IF v_stock < v_cantidad THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
        END IF;

        UPDATE producto
        SET stock = stock - v_cantidad
        WHERE id_producto = v_id_producto;

        INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio)
        VALUES (v_id_venta, v_id_producto, v_cantidad, v_precio);

        SET v_total = v_total + (v_precio * v_cantidad);
        SET v_idx = v_idx + 1;
    END WHILE;

    UPDATE venta
    SET precio_total = v_total
    WHERE id_venta = v_id_venta;

    COMMIT;

    SELECT v_id_venta AS id_venta, v_total AS precio_total;
END$$

DELIMITER ;
