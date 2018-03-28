// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {Transition} from '@uirouter/core';
import {WorkPackageCacheService} from 'core-components/work-packages/work-package-cache.service';
import {Component, Inject, Input, OnDestroy} from '@angular/core';
import {I18nToken} from '../../../angular4-transition-utils';
import {WorkPackageResourceInterface} from 'core-components/api/api-v3/hal-resources/work-package-resource.service';
import {componentDestroyed} from 'ng2-rx-componentdestroyed';

@Component({
  template: require('!!raw-loader!./relations-tab.html'),
  selector: 'wp-relations-tab',
})
export class WorkPackageRelationsTabComponent implements OnDestroy {
  @Input() public workPackageId?:string;
  public workPackage:WorkPackageResourceInterface;

  public constructor(@Inject(I18nToken) readonly I18n:op.I18n,
                     readonly $transition:Transition,
                     readonly wpCacheService:WorkPackageCacheService) {

    const wpId = this.workPackageId || this.$transition.params('to').workPackageId;
    wpCacheService.loadWorkPackage(wpId)
      .values$()
      .takeUntil(componentDestroyed(this))
      .subscribe((wp) => {
        this.workPackageId = wp.id;
        this.workPackage = wp;
      });
  }

  ngOnDestroy() {
    // Nothing to do
  }
}
