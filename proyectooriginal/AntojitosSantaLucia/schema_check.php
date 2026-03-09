<?php
require_once("config/conexion.php");
class FixDB extends Conectar {
  public function run() {
    $c = $this->Conexion();
    $stmt = $c->query("DESCRIBE rv_gastos");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
  }
}
$f = new FixDB();
$f->run();
?>
