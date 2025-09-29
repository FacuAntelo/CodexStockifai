import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Categoria } from '../models/categoria';
import { LocalizadorPartesResponse } from '../models/localizador-partes';
import { Marca } from '../models/marca';
import { PagedResponse } from '../models/paged-response';
import { Repuesto } from '../models/repuesto';
import { RestService } from './rest.service';

@Injectable({ providedIn: 'root' })
export class RepuestosService {
    constructor(private restService: RestService) {}

    getMarcas(): Observable<Marca[]> {
        return this.restService.get<Marca[]>(`marcas`);
    }

    getCategorias(): Observable<Categoria[]> {
        return this.restService.get<Categoria[]>(`categorias`);
    }

    getRepuestos(
        page = 1,
        pageSize = 10,
        filtro?: { searchText: string; idMarca: string; idCategoria: string }
    ): Observable<PagedResponse<Repuesto>> {
        let params = new HttpParams().set('page', page).set('page_size', pageSize);

        if (filtro?.idMarca) params = params.set('marca_id', filtro.idMarca);
        if (filtro?.idCategoria) params = params.set('categoria_id', filtro.idCategoria);
        if (filtro?.searchText) params = params.set('search_text', filtro.searchText);

        return this.restService.get<PagedResponse<Repuesto>>(`repuestos`, params);
    }

    importarRepuestos(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        return this.restService.upload('importaciones/catalogo', formData);
    }

    localizarParte(numeroPieza: string): Observable<LocalizadorPartesResponse> {
        // TODO: restaurar la consulta real cuando la API de localizador vuelva a estar disponible.
        // const params = new HttpParams().set('numero_pieza', numeroPieza);
        // return this.restService.get<LocalizadorPartesResponse>('localizador-partes', params);

        const respuestaSimulada: LocalizadorPartesResponse = {
            repuesto: {
                numero_pieza: numeroPieza,
                descripcion: 'Bomba de agua compatible con motores 1.6L',
                estado: 'activo',
                marca: {
                    id: 1,
                    nombre: 'MotorLine',
                },
                categoria: {
                    id: 12,
                    nombre: 'Sistema de refrigeración',
                    descripcion: 'Componentes del sistema de refrigeración del motor',
                },
            },
            talleres: [
                {
                    id: 1,
                    nombre: 'Taller Central',
                    direccion: 'Av. Rivadavia 1234, CABA',
                    telefono: '11-5555-1234',
                    email: 'central@talleres.com',
                    latitud: -34.603722,
                    longitud: -58.381592,
                    stock_total: 4,
                },
                {
                    id: 2,
                    nombre: 'Mecánica del Sur',
                    direccion: 'Calle 50 742, La Plata',
                    telefono: '221-444-7788',
                    email: 'contacto@mecanicadelsur.com',
                    latitud: -34.920495,
                    longitud: -57.953566,
                    stock_total: 2,
                },
                {
                    id: 3,
                    nombre: 'Taller Norte',
                    direccion: 'Av. Sarmiento 3500, Rosario',
                    telefono: '341-555-6677',
                    email: 'ventas@tallernorte.com',
                    latitud: -32.944242,
                    longitud: -60.650539,
                    stock_total: 5,
                },
                {
                    id: 4,
                    nombre: 'Garage Oeste',
                    direccion: 'Av. San Martín 255, Morón',
                    telefono: '11-4667-8899',
                    email: 'hola@garageoeste.com',
                    latitud: -34.653355,
                    longitud: -58.619737,
                    stock_total: 1,
                },
            ],
        };

        return of(respuestaSimulada).pipe(delay(400));
    }
}
