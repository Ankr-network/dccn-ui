
import {of as observableOf,  BehaviorSubject ,  Observable } from 'rxjs';

import {map, first} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { EndpointsService } from '../../../../../core/endpoints.service';
import { ActiveRouteCfOrgSpace } from '../../../../../features/cloud-foundry/cf-page.types';
import { ListView } from '../../../../../store/actions/list.actions';
import { AppState } from '../../../../../store/app-state';
import { endpointsRegisteredEntitiesSelector } from '../../../../../store/selectors/endpoint.selectors';
import { APIResource } from '../../../../../store/types/api.types';
import { CfOrgSpaceItem } from '../../../../data-services/cf-org-space-service.service';
import { IListConfig, IListMultiFilterConfig, ListViewTypes } from '../../list.component.types';
import { createListFilterConfig } from '../../list.helper';
import { CfServiceCardComponent } from './cf-service-card/cf-service-card.component';
import { CfServicesDataSource } from './cf-services-data-source';
import { ITableColumn } from '../../list-table/table.types';
import { EndpointModel } from '../../../../../store/types/endpoint.types';

@Injectable()
export class CfServicesListConfigService implements IListConfig<APIResource> {
  cf: CfOrgSpaceItem;
  isLocal: true;
  viewType = ListViewTypes.CARD_ONLY;
  enableTextFilter = true;
  dataSource: CfServicesDataSource;
  cardComponent = CfServiceCardComponent;
  defaultView = 'cards' as ListView;
  multiFilterConfigs: IListMultiFilterConfig[] = [];
  text = {
    title: null,
    filter: 'Search by name',
    noEntries: 'There are no services'
  };
  columns: ITableColumn<APIResource>[] = [{
    columnId: 'label',
    headerCell: () => 'Name',
    sort: {
      type: 'sort',
      orderKey: 'label',
      field: 'entity.label'
    },
  }, {
    columnId: 'active',
    headerCell: () => 'Active',
    sort: {
      type: 'sort',
      orderKey: 'active',
      field: 'entity.active'
    },
  }, {
    columnId: 'bindable',
    headerCell: () => 'Bindable',
    sort: {
      type: 'sort',
      orderKey: 'bindable',
      field: 'entity.bindable'
    },
  }];

  constructor(
    private store: Store<AppState>,
    private activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
    private endpointsService: EndpointsService
  ) {
    this.dataSource = new CfServicesDataSource(this.store, activeRouteCfOrgSpace.cfGuid, this);
    this.cf = {
      list$: this.store
        .select(endpointsRegisteredEntitiesSelector).pipe(
        first(),
        map(endpoints => {
          return Object.values(endpoints)
            .filter((endpoint: EndpointModel) => endpoint.connectionStatus === 'connected' && endpoint.cnsi_type === 'web');
        }), ),
      loading$: observableOf(false),
      select: new BehaviorSubject(undefined)
    };
    this.multiFilterConfigs = [
      createListFilterConfig('web', 'Cloud Foundry', this.cf),
    ];
  }

  getColumns = () => this.columns;
  getGlobalActions = () => [];
  getMultiActions = () => [];
  getSingleActions = () => [];
  getMultiFiltersConfigs = () => this.multiFilterConfigs;
  getDataSource = () => this.dataSource;
}
