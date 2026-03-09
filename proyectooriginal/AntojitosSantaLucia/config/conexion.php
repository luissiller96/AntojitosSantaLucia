<?php
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}

class Conectar
{
  protected $dbh;
  private static $instance = null;

  protected function Conexion()
  {
    // 1. Establecemos la zona horaria para PHP. Esto asegura que la función date() de PHP funcione correctamente.
    date_default_timezone_set('America/Mexico_City');

    if (self::$instance === null) {
      try {
       // $host = '193.203.166.204';
        //$dbname = 'u240307858_losjemos';
        //$username = 'u240307858_losjemos';




         // La dirección IP de tu Droplet donde está la base de datos
   $host = '192.241.159.227';

    // El nombre de la base de datos que creamos en el Droplet
   $dbname = 'db_antojitossantalucia';

    // El usuario que creamos específicamente para la conexión desde Hostinger
   $username = 'remote_user';

    // La contraseña que le asignaste al usuario 'hostinger_user'
    $password = 'k]K^l&Yw!J7';

        $pdo_options = [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
          PDO::ATTR_EMULATE_PREPARES => false,
          PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'" // Forma moderna de set_names
        ];

        // 2. Nos conectamos a la base de datos.
        self::$instance = new PDO(
          "mysql:host=$host;dbname=$dbname;charset=utf8",
          $username,
          $password,
          $pdo_options
        );

        // 3. Establecemos la zona horaria para la sesión de MySQL.
        //    Intentamos el nombre completo primero, que es más preciso.
        try {
          self::$instance->exec("SET time_zone = 'America/Mexico_City'");
        } catch (PDOException $e) {
          // Si falla (porque el servidor no tiene las zonas horarias IANA), usamos el desfase UTC-6 como respaldo.
          self::$instance->exec("SET time_zone = '-06:00'");
        }
      } catch (PDOException $e) {
        error_log("Error de conexión a la BD: " . $e->getMessage());
        die("¡Error BD! Por favor, inténtelo de nuevo más tarde.");
      }
    }
    return self::$instance;
  }

  // Esta función ya no es necesaria porque la configuramos en las opciones de PDO.
  public function set_names()
  {
    return true;
  }

  public static function obtenerConexionUnica()
  {
    $connector = new Conectar();
    return $connector->Conexion();
  }

  static public function ruta()
  {
    return "/";
  }
}