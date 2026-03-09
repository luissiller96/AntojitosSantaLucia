<?php
require_once(__DIR__ . '/../config/conexion.php');

class RangoCortesHelper extends Conectar
{
    /**
     * Obtiene el rango entre los dos últimos cortes de caja.
     * Si hay una caja activa, usa su fecha de apertura hasta el momento actual.
     */
    public static function obtenerRangoUltimosCortes()
    {
        $helper = new self();
        $conectar = $helper->Conexion();
        $helper->set_names();

        // 1. Si hay una caja activa, regresamos desde apertura hasta ahora
        $stmtActiva = $conectar->prepare("SELECT fecha_apertura FROM rv_apertura_caja WHERE estatus = 'activa' ORDER BY fecha_apertura DESC LIMIT 1");
        $stmtActiva->execute();
        $cajaActiva = $stmtActiva->fetch(PDO::FETCH_ASSOC);

        if ($cajaActiva && !empty($cajaActiva['fecha_apertura'])) {
            return [
                self::normalizarFecha($cajaActiva['fecha_apertura']),
                date('Y-m-d H:i:s')
            ];
        }

        // 2. Buscar los dos últimos cierres completos
        $stmtCierres = $conectar->prepare("SELECT fecha_apertura, fecha_cierre FROM rv_apertura_caja WHERE estatus = 'cerrada' AND fecha_cierre IS NOT NULL ORDER BY fecha_cierre DESC LIMIT 2");
        $stmtCierres->execute();
        $cierres = $stmtCierres->fetchAll(PDO::FETCH_ASSOC);

        if (empty($cierres)) {
            $hoy = date('Y-m-d');
            return [$hoy . ' 00:00:00', $hoy . ' 23:59:59'];
        }

        $ultimo = $cierres[0];
        $penultimo = $cierres[1] ?? null;

        $fin = self::normalizarFecha($ultimo['fecha_cierre'] ?? date('Y-m-d H:i:s'));
        if ($penultimo && !empty($penultimo['fecha_cierre'])) {
            $inicio = self::normalizarFecha($penultimo['fecha_cierre']);
        } else {
            $inicio = self::normalizarFecha($ultimo['fecha_apertura'] ?? $fin);
        }

        if (strtotime($inicio) > strtotime($fin)) {
            $inicio = date('Y-m-d H:i:s', strtotime('-1 day', strtotime($fin)));
        }

        return [$inicio, $fin];
    }

    private static function normalizarFecha($valor)
    {
        $timestamp = strtotime($valor);
        if ($timestamp === false) {
            $timestamp = time();
        }
        return date('Y-m-d H:i:s', $timestamp);
    }
}
