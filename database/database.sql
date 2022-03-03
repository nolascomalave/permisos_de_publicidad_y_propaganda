-- Creación de la Base de Datos:
CREATE DATABASE asuntos_publicos;

-- Usar Base de Datos "asuntos_publicos":
USE asuntos_publicos;

-- Creación de la Tabla "permisos_bebidas":
CREATE TABLE permisos_bebidas(
	id INT(11) NOT NULL PRIMARY KEY,
	codigo_permiso VARCHAR(200) NOT NULL,
	habilitacion DATE NOT NULL,
	vencimiento DATE NOT NULL,
	horario VARCHAR(30) NOT NULL,
	dat_confirmacion BOOLEAN NOT NULL,
	requisitor_nombre VARCHAR(50) NOT NULL,
	requisitor_apellido VARCHAR(50) NOT NULL,
	requisitor_doc VARCHAR(15) NOT NULL,
	requisitor_tlf VARCHAR(50) NOT NULL,
	requisitor_habitacion TEXT(1000) NOT NULL,
	sector_permisado TEXT(1000) NOT NULL,
	comprobante_de_pago VARCHAR(2500) NOT NULL,
	permiso_autorizado VARCHAR(2500) NOT NULL,
	creador VARCHAR(200) NOT NULL,
	editor VARCHAR(200) NOT NULL,
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	emitido BOOLEAN NOT NULL,
	cancelado BOOLEAN NOT NULL,
	observacion TEXT(1000) NOT NULL
);
ALTER TABLE permisos_bebidas
	MODIFY id INT(11) NOT NULL AUTO_INCREMENT;


-- Creación de la Tabla "permisos_eventos":
CREATE TABLE permisos_eventos(
	id INT(11) NOT NULL PRIMARY KEY,
	codigo_permiso VARCHAR(200) NOT NULL,
	habilitacion DATE NOT NULL,
	vencimiento DATE NOT NULL,
	horario VARCHAR(30) NOT NULL,
	dat_confirmacion BOOLEAN NOT NULL,
	requisitor_nombre VARCHAR(50) NOT NULL,
	requisitor_apellido VARCHAR(50) NOT NULL,
	requisitor_doc VARCHAR(15) NOT NULL,
	requisitor_tlf VARCHAR(50) NOT NULL,
	requisitor_habitacion TEXT(1000) NOT NULL,
	sector_permisado TEXT(1000) NOT NULL,
	comprobante_de_pago VARCHAR(2500) NOT NULL,
	nombre_evento VARCHAR(76) NOT NULL,
	tipo_evento VARCHAR(100) NOT NULL,
	servicio_comida BOOLEAN NOT NULL,
	servicio_bebidas BOOLEAN NOT NULL,
	servicio_confiteria BOOLEAN NOT NULL,
	servicio_articulos_varios BOOLEAN NOT NULL,
	servicio_heladeria BOOLEAN NOT NULL,
	servicio_otros VARCHAR(100) NOT NULL,
	permiso_autorizado VARCHAR(2500) NOT NULL,
	creador VARCHAR(200) NOT NULL,
	editor VARCHAR(200) NOT NULL,
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	emitido BOOLEAN NOT NULL,
	cancelado BOOLEAN NOT NULL,
	observacion TEXT(1000) NOT NULL
);
ALTER TABLE permisos_eventos
	MODIFY id INT(11) NOT NULL AUTO_INCREMENT;


-- Creación de la Tabla "permisos_publicidad":
CREATE TABLE permisos_publicidad(
	id INT(11) NOT NULL PRIMARY KEY,
	codigo_permiso VARCHAR(200) NOT NULL,
	habilitacion DATE NOT NULL,
	vencimiento DATE NOT NULL,
	horario VARCHAR(30) NOT NULL,
	dat_confirmacion BOOLEAN NOT NULL,
	requisitor_nombre VARCHAR(50) NOT NULL,
	requisitor_apellido VARCHAR(50) NOT NULL,
	requisitor_doc VARCHAR(15) NOT NULL,
	requisitor_tlf VARCHAR(50) NOT NULL,
	requisitor_habitacion TEXT(1000) NOT NULL,
	sector_permisado TEXT(1000) NOT NULL,
	publicidad_volantes INT(11) NOT NULL,
	publicidad_afiches INT(11) NOT NULL,
	publicidad_pendones INT(11) NOT NULL,
	publicidad_habladores INT(11) NOT NULL,
	publicidad_stands INT(11) NOT NULL,
	publicidad_calcomanias INT(11) NOT NULL,
	publicidad_banderolas INT(11) NOT NULL,
	publicidad_otros INT(11) NOT NULL,
	publicidad_otros_descripcion VARCHAR(100) NOT NULL,
	comentarios TEXT(1000) NOT NULL,
	comprobante_de_pago VARCHAR(2500) NOT NULL,
	permiso_autorizado VARCHAR(2500) NOT NULL,
	creador VARCHAR(200) NOT NULL,
	editor VARCHAR(200) NOT NULL,
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	emitido BOOLEAN NOT NULL,
	cancelado BOOLEAN NOT NULL,
	observacion TEXT(1000) NOT NULL
);
ALTER TABLE permisos_publicidad
	MODIFY id INT(11) NOT NULL AUTO_INCREMENT;


-- Creación de la Tabla "usuarios":
CREATE TABLE usuarios(
	idDocument VARCHAR(50) NOT NULL PRIMARY KEY,
	nombre VARCHAR(50) NOT NULL,
	apellido VARCHAR(50) NOT NULL,
	cargo VARCHAR(50) NOT NULL,
	tipo_usuario VARCHAR (50) NOT NULL,
	username VARCHAR(1000) NOT NULL,
	password VARCHAR(2500) NOT NULL,
);