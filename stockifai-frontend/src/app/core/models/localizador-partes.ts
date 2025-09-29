import { Repuesto } from './repuesto';

export interface TallerDisponibilidad {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    latitud: number | null;
    longitud: number | null;
    stock_total: number;
}

export interface LocalizadorPartesResponse {
    repuesto: Repuesto | null;
    talleres: TallerDisponibilidad[];
}
