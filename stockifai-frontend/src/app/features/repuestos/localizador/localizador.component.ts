import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LocalizadorPartesResponse, TallerDisponibilidad } from '../../../core/models/localizador-partes';
import { Repuesto } from '../../../core/models/repuesto';
import { RepuestosService } from '../../../core/services/repuestos.service';
import { TitleService } from '../../../core/services/title.service';

declare const L: any;

@Component({
    selector: 'app-localizador',
    templateUrl: './localizador.component.html',
    styleUrl: './localizador.component.scss',
})
export class LocalizadorComponent implements OnDestroy {
    numeroPieza = '';
    loading = false;
    errorMessage = '';
    resultado?: LocalizadorPartesResponse;
    ultimaBusqueda = '';

    @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;
    private mapInstance?: any;

    constructor(private titleService: TitleService, private repuestosService: RepuestosService) {
        this.titleService.setTitle('Localizador de partes');
    }

    get repuestoSeleccionado(): Repuesto | null {
        return this.resultado?.repuesto ?? null;
    }

    get talleres(): TallerDisponibilidad[] {
        return this.resultado?.talleres ?? [];
    }

    get talleresConCoordenadas(): TallerDisponibilidad[] {
        return this.talleres.filter((t) => typeof t.latitud === 'number' && typeof t.longitud === 'number');
    }

    trackByTaller(_: number, item: TallerDisponibilidad): number {
        return item.id;
    }

    buscar() {
        const termino = this.numeroPieza.trim();
        this.errorMessage = '';

        if (!termino) {
            this.errorMessage = 'Ingresá el número de pieza que querés localizar.';
            this.resultado = undefined;
            this.destruirMapa();
            return;
        }

        this.loading = true;

        // Se mantiene la referencia al servicio para restaurar la llamada real más adelante.
        void this.repuestosService;

        // TODO: Rehabilitar la consulta real cuando la API esté disponible nuevamente.
        // this.repuestosService.localizarParte(termino).subscribe({
        //     next: (resp) => {
        //         this.resultado = resp;
        //         this.ultimaBusqueda = termino;
        //         this.loading = false;
        //         this.numeroPieza = termino;
        //         setTimeout(() => this.inicializarMapa(), 0);
        //     },
        //     error: () => {
        //         this.errorMessage = 'No pudimos consultar la disponibilidad. Intentá nuevamente.';
        //         this.loading = false;
        //         this.resultado = undefined;
        //         this.destruirMapa();
        //     },
        // });

        const respuestaSimulada: LocalizadorPartesResponse = {
            repuesto: {
                numero_pieza: termino,
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

        setTimeout(() => {
            this.resultado = respuestaSimulada;
            this.ultimaBusqueda = termino;
            this.loading = false;
            this.numeroPieza = termino;
            setTimeout(() => this.inicializarMapa(), 0);
        }, 400);
    }

    limpiarBusqueda() {
        this.numeroPieza = '';
        this.resultado = undefined;
        this.errorMessage = '';
        this.ultimaBusqueda = '';
        this.destruirMapa();
    }

    private inicializarMapa() {
        const container = this.mapContainer?.nativeElement;
        const talleres = this.talleresConCoordenadas;

        this.destruirMapa();

        if (!container || talleres.length === 0) {
            return;
        }

        this.mapInstance = L.map(container, {
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.mapInstance);

        const puntos = talleres.map((t) => L.latLng(t.latitud, t.longitud));

        talleres.forEach((taller, index) => {
            const punto = puntos[index];
            const marcador = L.circleMarker(punto, {
                radius: 10,
                color: '#0d6efd',
                weight: 2,
                fillColor: '#0d6efd',
                fillOpacity: 0.85,
            }).addTo(this.mapInstance);

            const direccion = taller.direccion?.trim() || 'Sin dirección registrada';
            marcador.bindPopup(
                `<div class="map-popup"><strong>${taller.nombre}</strong><br/>${direccion}<br/><span class="text-muted">Stock disponible: ${taller.stock_total}</span></div>`
            );
        });

        if (puntos.length === 1) {
            this.mapInstance.setView(puntos[0], 13);
        } else {
            const bounds = L.latLngBounds(puntos);
            this.mapInstance.fitBounds(bounds, { padding: [24, 24] });
        }
    }

    private destruirMapa() {
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = undefined;
        }
    }

    ngOnDestroy(): void {
        this.destruirMapa();
    }
}
