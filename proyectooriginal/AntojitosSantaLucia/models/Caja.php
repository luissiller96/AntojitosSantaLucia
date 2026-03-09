  <?php

date_default_timezone_set('America/Mexico_City');

class Caja extends Conectar
{

public function get_productos()
{
    $conectar = parent::Conexion();
    parent::set_names();
    
    // ✅ Se reincorpora la columna 'p.pr_favorito' a la consulta.
    $sql = "SELECT 
                p.ID, 
                p.pr_nombre, 
                c.nombre AS pr_categoria,
                p.pr_precioventa,
                p.pr_favorito, 
                p.pr_stock 
            FROM 
                rv_productos AS p
            INNER JOIN 
                rv_categorias AS c ON p.categoria_id = c.id
            WHERE 
                p.pr_estatus = 1";

    $sql = $conectar->prepare($sql);
    $sql->execute();
    return $sql->fetchAll(PDO::FETCH_ASSOC);
}


  public function actualizarStock($productoId, $cantidadVendida)
  {
    $conectar = parent::Conexion();
    parent::set_names();
    $sql = "UPDATE rv_productos SET pr_stock = pr_stock - ? WHERE ID = ?";
    $stmt = $conectar->prepare($sql);
    $stmt->execute([$cantidadVendida, $productoId]);

    return $stmt->rowCount();
  }

  /**
   * Obtiene el catálogo completo de ingredientes para poblar el modal
   * de personalización de platillos (ingredientes a omitir).
   */
  public function get_ingredientes_para_modal()
  {
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "SELECT ingrediente_id, nombre_ingrediente, categoria 
            FROM rv_ingredientes 
            WHERE es_activo = 1
            ORDER BY categoria, nombre_ingrediente";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

}
